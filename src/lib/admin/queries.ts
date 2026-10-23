import "server-only";

import { getDictionary, type Locale } from "@/lib/i18n";
import { buildItem } from "@/lib/stock/buildItem";
import {
  ADMIN_ITEM_COLUMNS,
  IMAGE_COLUMNS,
  storagePublicUrl,
  toItemSeed,
  type StockImageRow,
  type StockItemRow,
} from "@/lib/stock/dbCatalog";
import { deriveCategoryKey, isCategoryKey, segmentKey } from "@/lib/stock/taxonomy";
import { isStockStatus, type StockItem } from "@/lib/stock/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getAdminUser } from "./auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminImage, AdminItem, AdminStats, AuditEntry, LocalizedText } from "./types";

/**
 * Resultado explícito: `error` NUNCA é confundido com "nenhum molde".
 * Quem renderiza decide entre "catálogo vazio" e "deu ruim aqui" — o dono
 * precisa enxergar a diferença.
 */
export interface AdminCatalogResult {
  items: AdminItem[];
  error: string | null;
}

const NOT_CONFIGURED =
  "O painel ainda não está conectado ao Supabase. Confira as variáveis de ambiente e rode as migrations.";

function cleanLocalized(value: Record<string, string> | null): LocalizedText {
  if (!value) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, text]) => typeof text === "string" && text.trim())
  );
}

function toAdminImage(row: StockImageRow): AdminImage {
  const source = row.source === "legacy" ? "legacy" : "storage";
  const variants = (Array.isArray(row.variants) ? row.variants : []).filter(
    (variant) => variant && typeof variant.ref === "string" && variant.w > 0
  );
  const sorted = [...variants].sort((a, b) => a.w - b.w);
  const smallest = sorted[0];

  return {
    id: row.id,
    type: row.type === "result" ? "result" : "mold",
    source,
    variants: sorted,
    thumbUrl: smallest
      ? source === "legacy"
        ? smallest.ref
        : storagePublicUrl(smallest.ref)
      : "",
    width: row.width,
    height: row.height,
    color: row.color ?? "#041c44",
    isCover: row.is_cover === true,
    sortOrder: row.sort_order ?? 0,
    fileName: row.file_name,
    alt: cleanLocalized(row.alt),
  };
}

/** O painel fala português; o título exibido usa o mesmo motor do site. */
function toAdminItem(row: StockItemRow, imageRows: StockImageRow[]): AdminItem {
  const dict = getDictionary("pt");
  const seed = toItemSeed(row, imageRows);
  const rendered = buildItem(seed, "pt", dict);

  // O formulário mostra o valor EFETIVO, não a coluna crua: um item
  // importado tem categoria e cavidades nulas no banco (deduzidas do slug),
  // e exibi-las vazias faria o painel discordar da página pública.
  const categoryKey =
    row.category_key && isCategoryKey(row.category_key)
      ? row.category_key
      : deriveCategoryKey(row.slug);

  return {
    id: row.id,
    slug: row.slug,
    segment: segmentKey(row.segment ?? "outros"),
    categoryKey,
    kind: row.kind === "collection" ? "collection" : "mold",
    status: row.status && isStockStatus(row.status) ? row.status : "draft",
    featured: row.featured === true,
    sortOrder: row.sort_order ?? 0,
    cavities: rendered.cavities,
    volume: rendered.volume,
    partWeight: rendered.partWeight,
    name: cleanLocalized(row.name),
    title: cleanLocalized(row.title),
    subject: cleanLocalized(row.subject),
    summary: cleanLocalized(row.summary),
    internalNotes: row.internal_notes ?? "",
    institutional: row.institutional === true,
    legacySource: row.legacy_source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    displayTitle: rendered.title,
    categoryLabel: dict.stock.categories[categoryKey],
    segmentLabel: rendered.segmentLabel,
    images: imageRows
      .map(toAdminImage)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

/** Catálogo completo do painel: todos os status, inclusive arquivados. */
export async function getAdminCatalog(): Promise<AdminCatalogResult> {
  if (!hasSupabaseEnv()) return { items: [], error: NOT_CONFIGURED };

  const admin = await getAdminUser();
  if (!admin) return { items: [], error: "Sessão expirada. Entre novamente." };

  try {
    const supabase = await createClient();

    const { data: items, error: itemsError } = await supabase
      .from("stock_items")
      .select(ADMIN_ITEM_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (itemsError) return { items: [], error: itemsError.message };
    const rows = (items ?? []) as StockItemRow[];
    if (rows.length === 0) return { items: [], error: null };

    const { data: images, error: imagesError } = await supabase
      .from("stock_images")
      .select(IMAGE_COLUMNS)
      .in(
        "item_id",
        rows.map((row) => row.id)
      )
      .order("sort_order", { ascending: true });

    if (imagesError) return { items: [], error: imagesError.message };

    const byItem = new Map<string, StockImageRow[]>();
    for (const image of (images ?? []) as StockImageRow[]) {
      const list = byItem.get(image.item_id);
      if (list) list.push(image);
      else byItem.set(image.item_id, [image]);
    }

    return {
      items: rows.map((row) => toAdminItem(row, byItem.get(row.id) ?? [])),
      error: null,
    };
  } catch (cause) {
    return {
      items: [],
      error: cause instanceof Error ? cause.message : "Erro desconhecido ao ler o catálogo.",
    };
  }
}

export async function getAdminItem(id: string): Promise<AdminItem | null> {
  if (!hasSupabaseEnv()) return null;
  const admin = await getAdminUser();
  if (!admin) return null;

  try {
    const supabase = await createClient();
    const { data: item, error } = await supabase
      .from("stock_items")
      .select(ADMIN_ITEM_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error || !item) return null;

    const { data: images } = await supabase
      .from("stock_images")
      .select(IMAGE_COLUMNS)
      .eq("item_id", id)
      .order("sort_order", { ascending: true });

    return toAdminItem(item as StockItemRow, (images ?? []) as StockImageRow[]);
  } catch {
    return null;
  }
}

const RECENT_DAYS = 7;

export function buildStats(items: AdminItem[]): AdminStats {
  const since = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;

  // A galeria institucional ilustra o galpão no topo do /estoque; não é um
  // produto e contá-la inflaria todos os números do painel.
  const products = items.filter((item) => !item.institutional);
  const active = products.filter((item) => item.status !== "archived");

  return {
    total: active.length,
    published: products.filter((item) => item.status === "published").length,
    draft: products.filter((item) => item.status === "draft").length,
    hiddenOrSold: products.filter(
      (item) => item.status === "hidden" || item.status === "sold"
    ).length,
    archived: products.filter((item) => item.status === "archived").length,
    withoutPhotos: active.filter((item) => item.images.length === 0).length,
    withResult: active.filter((item) =>
      item.images.some((image) => image.type === "result")
    ).length,
    recentlyUpdated: active.filter((item) => Date.parse(item.updatedAt) >= since).length,
  };
}

/**
 * O item como o site o renderizaria, para a pré-visualização.
 *
 * Um rascunho não pode ser aberto em `/estoque/<slug>`: a RLS o esconde, e é
 * isso que se espera dela. Então o painel monta o `StockItem` pelo MESMO
 * caminho do site (`buildItem`) e renderiza com os mesmos componentes — a
 * prévia mostra o resultado real, sem abrir brecha na visibilidade pública.
 */
export async function getItemPreview(
  id: string,
  locale: Locale
): Promise<StockItem | null> {
  if (!hasSupabaseEnv()) return null;
  const admin = await getAdminUser();
  if (!admin) return null;

  try {
    const supabase = await createClient();
    const { data: item, error } = await supabase
      .from("stock_items")
      .select(ADMIN_ITEM_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error || !item) return null;

    const { data: images } = await supabase
      .from("stock_images")
      .select(IMAGE_COLUMNS)
      .eq("item_id", id)
      .order("sort_order", { ascending: true });

    const seed = toItemSeed(item as StockItemRow, (images ?? []) as StockImageRow[]);
    return buildItem(seed, locale, getDictionary(locale));
  } catch {
    return null;
  }
}

/** Histórico recente de um item, para o rodapé do formulário de edição. */
export async function getItemHistory(itemId: string, limit = 12): Promise<AuditEntry[]> {
  if (!hasSupabaseEnv()) return [];
  const admin = await getAdminUser();
  if (!admin) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("stock_audit_log")
      .select("id, action, item_slug, user_id, details, created_at")
      .eq("item_id", itemId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    // O log guarda o UUID; o e-mail sai de admin_users, a única tabela de
    // usuários que o painel pode ler.
    const { data: admins } = await supabase.from("admin_users").select("user_id, email");
    const emails = new Map((admins ?? []).map((row) => [row.user_id, row.email]));

    return data.map((row) => ({
      id: row.id,
      action: row.action,
      itemSlug: row.item_slug,
      userEmail: row.user_id ? (emails.get(row.user_id) ?? null) : null,
      createdAt: row.created_at,
      details: (row.details ?? {}) as Record<string, unknown>,
    }));
  } catch {
    return [];
  }
}
