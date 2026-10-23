/**
 * Leitura do catálogo — ponto único para todo o site.
 *
 * Existe UMA fonte de verdade por ambiente, nunca duas concorrentes:
 *
 *   Supabase configurado → o banco manda, e só ele. Item apagado no painel
 *                          não ressuscita a partir dos arquivos locais.
 *   Supabase ausente     → o acervo em arquivo, exatamente como o site
 *                          sempre funcionou. Serve para desenvolvimento e
 *                          para o período entre o deploy do código e a
 *                          configuração do banco.
 *
 * Falha de banco vira `error` preenchido — NUNCA uma lista vazia disfarçada
 * de "estoque sem itens".
 */

import { cache } from "react";
import type { Locale } from "@/lib/i18n";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { assembleCatalog } from "./buildItem";
import {
  IMAGE_COLUMNS,
  PUBLIC_ITEM_COLUMNS,
  toItemSeeds,
  type StockImageRow,
  type StockItemRow,
} from "./dbCatalog";
import { getFileSeeds } from "./parseStock";
import type { Catalog, StockItem } from "./types";

function emptyCatalog(error: string): Catalog {
  return {
    items: [],
    institutional: null,
    categories: [],
    totals: { items: 0, photos: 0, categories: 0, withResult: 0 },
    error,
    source: "supabase",
  };
}

/**
 * Busca os itens publicados.
 *
 * O filtro explícito por `status` acompanha a RLS em vez de depender só
 * dela: o resultado é o mesmo numa sessão anônima e numa sessão de admin
 * navegando no site público.
 */
async function fetchPublished(): Promise<
  { items: StockItemRow[]; images: StockImageRow[] } | { error: string }
> {
  const supabase = createPublicClient();

  const { data: items, error: itemsError } = await supabase
    .from("stock_items")
    .select(PUBLIC_ITEM_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (itemsError) return { error: itemsError.message };
  const rows = (items ?? []) as StockItemRow[];
  if (rows.length === 0) return { items: [], images: [] };

  const { data: images, error: imagesError } = await supabase
    .from("stock_images")
    .select(IMAGE_COLUMNS)
    .in(
      "item_id",
      rows.map((row) => row.id)
    )
    .order("sort_order", { ascending: true });

  if (imagesError) return { error: imagesError.message };

  return { items: rows, images: (images ?? []) as StockImageRow[] };
}

/**
 * Memoizado por render com `cache()` do React: a página do estoque, o
 * metadata e o JSON-LD pedem o catálogo separadamente e isso vira uma
 * consulta só. Entre requests não há cache aqui — quem controla a validade
 * é o ISR da página, invalidado por `revalidatePath` a cada alteração.
 */
export const getCatalog = cache(async (locale: Locale): Promise<Catalog> => {
  if (!hasSupabaseEnv()) {
    return assembleCatalog(getFileSeeds(), locale, "files");
  }

  try {
    const result = await fetchPublished();
    if ("error" in result) return emptyCatalog(result.error);

    // Banco acessível, porém SEM nenhum item publicado.
    //
    // Na prática isso significa "as variáveis foram configuradas mas a
    // importação ainda não rodou" — e publicar um catálogo vazio apagaria da
    // busca 42 páginas já indexadas. A 3WS tem estoque; zero não é um
    // resultado plausível, é um sintoma. Tratar como erro mantém o catálogo
    // anterior servido do cache e mostra o aviso em vez de uma vitrine vazia.
    if (result.items.length === 0) {
      return emptyCatalog(
        "O banco respondeu sem nenhum molde publicado. Rode a importação do acervo " +
          "(scripts/migrate-stock-to-supabase.mjs --apply) ou publique ao menos um item."
      );
    }

    return assembleCatalog(toItemSeeds(result.items, result.images), locale, "supabase");
  } catch (cause) {
    return emptyCatalog(
      cause instanceof Error ? cause.message : "Falha desconhecida ao ler o catálogo."
    );
  }
});

export async function getStockItems(locale: Locale): Promise<StockItem[]> {
  return (await getCatalog(locale)).items;
}

export async function getStockItem(
  locale: Locale,
  slug: string
): Promise<StockItem | undefined> {
  return (await getCatalog(locale)).items.find((item) => item.slug === slug);
}

export async function getStockCategories(locale: Locale) {
  return (await getCatalog(locale)).categories;
}

export async function getInstitutionalItem(locale: Locale) {
  return (await getCatalog(locale)).institutional;
}

/** Slugs publicados — iguais nos três idiomas, então independem de locale. */
export async function getStockSlugs(): Promise<string[]> {
  return (await getCatalog("pt")).items.map((item) => item.slug);
}

/** Outros moldes da mesma categoria — links internos reais entre as páginas. */
export async function getRelatedItems(
  locale: Locale,
  item: StockItem,
  limit = 4
): Promise<StockItem[]> {
  const items = await getStockItems(locale);
  const sameCategory = items.filter(
    (candidate) => candidate.slug !== item.slug && candidate.categoryKey === item.categoryKey
  );
  const fallback = items.filter(
    (candidate) => candidate.slug !== item.slug && candidate.categoryKey !== item.categoryKey
  );
  return [...sameCategory, ...fallback].slice(0, limit);
}
