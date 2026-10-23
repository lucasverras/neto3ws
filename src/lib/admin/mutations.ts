"use server";

import { STOCK_BUCKET } from "@/lib/supabase/env";
import { LOCALES, type Locale } from "@/lib/i18n";
import { isCategoryKey, SEGMENT_KEYS } from "@/lib/stock/taxonomy";
import { isStockStatus, type StockStatus } from "@/lib/stock/types";
import { NotAuthorizedError, requireAdmin } from "./auth";
import { MAX_IMAGES_PER_ITEM, MAX_NOTES_LENGTH, MAX_SUMMARY_LENGTH, MAX_TEXT_LENGTH } from "./constants";
import { revalidateStock } from "./revalidate";
import { slugify, uniqueSlug } from "./slug";
import type { LocalizedText } from "./types";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface ImageInput {
  /** uuid existente, ou um novo gerado no navegador antes do upload. */
  id: string;
  type: "mold" | "result";
  source: "legacy" | "storage";
  variants: { w: number; ref: string }[];
  width: number;
  height: number;
  color: string;
  isCover: boolean;
  fileName: string | null;
  alt: LocalizedText;
}

export interface ItemInput {
  /** uuid gerado no navegador para já permitir subir fotos antes de salvar. */
  id: string;
  slug: string;
  segment: string;
  categoryKey: string;
  kind: "mold" | "collection";
  status: StockStatus;
  featured: boolean;
  cavities: number | null;
  volume: string;
  partWeight: string;
  name: LocalizedText;
  title: LocalizedText;
  subject: LocalizedText;
  summary: LocalizedText;
  internalNotes: string;
  images: ImageInput[];
}

function failure(cause: unknown, fallback: string): { ok: false; error: string } {
  if (cause instanceof NotAuthorizedError) return { ok: false, error: cause.message };
  return { ok: false, error: cause instanceof Error ? cause.message : fallback };
}

/** Remove idiomas vazios: `{}` no banco significa "usa o texto derivado". */
function cleanLocalized(value: LocalizedText, maxLength: number): Record<string, string> {
  const entries: [string, string][] = [];
  for (const locale of LOCALES) {
    const text = value[locale]?.trim();
    if (text) entries.push([locale, text.slice(0, maxLength)]);
  }
  return Object.fromEntries(entries);
}

function validate(input: ItemInput): string | null {
  const hasName = LOCALES.some((locale: Locale) => input.name[locale]?.trim());
  const hasTitle = LOCALES.some((locale: Locale) => input.title[locale]?.trim());
  if (!hasName && !hasTitle) return "Informe o nome do produto ou molde.";

  if (!isCategoryKey(input.categoryKey)) return "Categoria inválida.";
  if (!(SEGMENT_KEYS as string[]).includes(input.segment)) return "Segmento inválido.";
  if (!isStockStatus(input.status)) return "Status inválido.";
  if (input.kind !== "mold" && input.kind !== "collection") return "Tipo inválido.";

  if (input.cavities !== null && (!Number.isInteger(input.cavities) || input.cavities < 1 || input.cavities > 512)) {
    return "Número de cavidades inválido.";
  }
  if (input.images.length > MAX_IMAGES_PER_ITEM) {
    return `Limite de ${MAX_IMAGES_PER_ITEM} fotos por produto.`;
  }
  for (const image of input.images) {
    if (image.variants.length === 0) return "Uma das fotos não terminou de ser enviada.";
    if (!(image.width > 0 && image.height > 0)) return "Uma das fotos está sem dimensões.";
    if (image.source !== "legacy" && image.source !== "storage") return "Foto com origem inválida.";
  }
  return null;
}

function toItemRow(input: ItemInput) {
  return {
    slug: input.slug,
    segment: input.segment,
    category_key: input.categoryKey,
    kind: input.kind,
    status: input.status,
    featured: input.featured,
    cavities: input.cavities,
    volume: input.volume.trim() || null,
    part_weight: input.partWeight.trim() || null,
    name: cleanLocalized(input.name, MAX_TEXT_LENGTH),
    title: cleanLocalized(input.title, MAX_TEXT_LENGTH),
    subject: cleanLocalized(input.subject, MAX_TEXT_LENGTH),
    summary: cleanLocalized(input.summary, MAX_SUMMARY_LENGTH),
    internal_notes: input.internalNotes.trim().slice(0, MAX_NOTES_LENGTH) || null,
  };
}

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

/**
 * Reescreve a galeria do item a partir da lista que o dono vê na tela.
 *
 * A posição no array vira `sort_order` e a seção vira `type` — o que está na
 * tela é exatamente o que vai para o banco. Toda query é presa a `item_id`,
 * então um id de foto de outro produto enviado pelo navegador não é tocado.
 */
async function syncImages(
  supabase: Supabase,
  itemId: string,
  images: ImageInput[]
): Promise<string | null> {
  const { data: existing, error: readError } = await supabase
    .from("stock_images")
    .select("id, source, variants")
    .eq("item_id", itemId);

  if (readError) return readError.message;

  const keep = new Set(images.map((image) => image.id));
  const removed = (existing ?? []).filter((row) => !keep.has(row.id));

  if (removed.length > 0) {
    const { error } = await supabase
      .from("stock_images")
      .delete()
      .eq("item_id", itemId)
      .in(
        "id",
        removed.map((row) => row.id)
      );
    if (error) return error.message;

    // Arquivos órfãos no bucket viram custo e lixo. As fotos legadas ficam:
    // elas moram em public/acervo e são recriadas pelo build.
    const orphans = removed
      .filter((row) => row.source === "storage")
      .flatMap((row) =>
        (Array.isArray(row.variants) ? row.variants : []).map(
          (variant: { ref: string }) => variant.ref
        )
      )
      .filter((ref): ref is string => typeof ref === "string" && ref.length > 0);

    if (orphans.length > 0) {
      await supabase.storage.from(STOCK_BUCKET).remove(orphans);
    }
  }

  if (images.length === 0) return null;

  // Índice único garante no máximo uma capa por item. Zerar antes de gravar
  // evita colisão quando a capa muda de foto na mesma operação.
  const { error: clearError } = await supabase
    .from("stock_images")
    .update({ is_cover: false })
    .eq("item_id", itemId);
  if (clearError) return clearError.message;

  const coverId = (images.find((image) => image.isCover) ?? images[0]).id;

  const { error: upsertError } = await supabase.from("stock_images").upsert(
    images.map((image, index) => ({
      id: image.id,
      item_id: itemId,
      type: image.type,
      source: image.source,
      variants: image.variants,
      width: image.width,
      height: image.height,
      color: image.color,
      is_cover: image.id === coverId,
      sort_order: index,
      file_name: image.fileName,
      alt: cleanLocalized(image.alt, MAX_TEXT_LENGTH),
    })),
    { onConflict: "id" }
  );

  return upsertError?.message ?? null;
}

async function takenSlugs(supabase: Supabase, exceptId?: string): Promise<Set<string>> {
  const query = supabase.from("stock_items").select("id, slug");
  const { data } = exceptId ? await query.neq("id", exceptId) : await query;
  return new Set((data ?? []).map((row: { slug: string }) => row.slug));
}

export async function createItem(
  input: ItemInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const { supabase } = await requireAdmin();

    // O id vem do navegador para que as fotos possam subir antes do primeiro
    // "Salvar". Ele não contorna autorização nenhuma: a RLS exige admin para
    // inserir, qualquer que seja o id. Excluí-lo da busca de slugs livres
    // deixa o salvamento idempotente — se a primeira tentativa gravou o item
    // mas falhou nas fotos, repetir atualiza em vez de criar um duplicado.
    const base = slugify(input.slug || input.name.pt || input.title.pt || "");
    const slug = uniqueSlug(base, await takenSlugs(supabase, input.id));

    // Produto novo entra no topo da vitrine, onde o dono espera encontrá-lo.
    const { data: first } = await supabase
      .from("stock_items")
      .select("sort_order")
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    const sortOrder = (first?.sort_order ?? 0) - 1;

    const { data, error } = await supabase
      .from("stock_items")
      .upsert(
        { id: input.id, ...toItemRow(input), slug, sort_order: sortOrder },
        { onConflict: "id" }
      )
      .select("id, slug")
      .single();

    if (error) return { ok: false, error: error.message };

    const imageError = await syncImages(supabase, data.id, input.images);
    if (imageError) return { ok: false, error: imageError };

    revalidateStock();
    return { ok: true, data: { id: data.id, slug: data.slug } };
  } catch (cause) {
    return failure(cause, "Não foi possível salvar o produto.");
  }
}

export async function updateItem(
  id: string,
  input: ItemInput
): Promise<ActionResult<{ slug: string }>> {
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const { supabase } = await requireAdmin();

    // O slug é a URL pública: preserva-se o que já existe, e só muda quando o
    // dono o edita de propósito. Renomear um molde não quebra o que o Google
    // já indexou.
    const base = slugify(input.slug || input.name.pt || input.title.pt || "");
    const slug = uniqueSlug(base, await takenSlugs(supabase, id));

    const { data, error } = await supabase
      .from("stock_items")
      .update({ ...toItemRow(input), slug })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) return { ok: false, error: error.message };

    const imageError = await syncImages(supabase, id, input.images);
    if (imageError) return { ok: false, error: imageError };

    revalidateStock();
    return { ok: true, data: { slug: data.slug } };
  } catch (cause) {
    return failure(cause, "Não foi possível atualizar o produto.");
  }
}

export async function setItemStatus(
  id: string,
  status: StockStatus
): Promise<ActionResult> {
  if (!isStockStatus(status)) return { ok: false, error: "Status inválido." };

  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("stock_items").update({ status }).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidateStock();
    return { ok: true, data: undefined };
  } catch (cause) {
    return failure(cause, "Não foi possível mudar o status.");
  }
}

export async function setItemFeatured(
  id: string,
  featured: boolean
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("stock_items").update({ featured }).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidateStock();
    return { ok: true, data: undefined };
  } catch (cause) {
    return failure(cause, "Não foi possível mudar o destaque.");
  }
}

/**
 * Cópia do produto como rascunho, com as fotos apontando para os MESMOS
 * arquivos do original.
 *
 * Duplicar não re-envia nada ao Storage: as variantes são compartilhadas. Por
 * isso a exclusão só apaga objetos que nenhum outro registro referencia.
 */
export async function duplicateItem(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase } = await requireAdmin();

    const { data: original, error } = await supabase
      .from("stock_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !original) return { ok: false, error: "Produto não encontrado." };

    const slug = uniqueSlug(`${original.slug}-copia`, await takenSlugs(supabase));

    const { data: created, error: insertError } = await supabase
      .from("stock_items")
      .insert({
        slug,
        segment: original.segment,
        category_key: original.category_key,
        kind: original.kind,
        // A cópia nasce como rascunho: duplicar não pode publicar sem querer.
        status: "draft",
        featured: false,
        sort_order: (original.sort_order ?? 0) - 1,
        cavities: original.cavities,
        volume: original.volume,
        part_weight: original.part_weight,
        name: original.name,
        title: original.title,
        subject: original.subject,
        summary: original.summary,
        internal_notes: original.internal_notes,
        institutional: false,
      })
      .select("id")
      .single();

    if (insertError) return { ok: false, error: insertError.message };

    const { data: images } = await supabase
      .from("stock_images")
      .select("type, source, variants, width, height, color, is_cover, sort_order, alt, file_name")
      .eq("item_id", id)
      .order("sort_order", { ascending: true });

    if (images && images.length > 0) {
      const { error: imageError } = await supabase.from("stock_images").insert(
        images.map((image) => ({ ...image, item_id: created.id }))
      );
      if (imageError) return { ok: false, error: imageError.message };
    }

    revalidateStock();
    return { ok: true, data: { id: created.id } };
  } catch (cause) {
    return failure(cause, "Não foi possível duplicar o produto.");
  }
}

/**
 * Exclusão definitiva.
 *
 * O caminho recomendado no painel é arquivar, que é reversível. Isto aqui
 * existe para o dono limpar um cadastro errado — e apaga do Storage só os
 * arquivos que nenhum outro produto estiver usando (um duplicado compartilha
 * as mesmas fotos).
 */
export async function deleteItem(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: images } = await supabase
      .from("stock_images")
      .select("variants")
      .eq("item_id", id)
      .eq("source", "storage");

    const refs = new Set(
      (images ?? []).flatMap((row) =>
        (Array.isArray(row.variants) ? row.variants : [])
          .map((variant: { ref?: string }) => variant?.ref)
          .filter((ref: unknown): ref is string => typeof ref === "string" && ref.length > 0)
      )
    );

    const { error } = await supabase.from("stock_items").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    if (refs.size > 0) {
      const { data: survivors } = await supabase
        .from("stock_images")
        .select("variants")
        .eq("source", "storage");

      for (const row of survivors ?? []) {
        for (const variant of Array.isArray(row.variants) ? row.variants : []) {
          if (typeof variant?.ref === "string") refs.delete(variant.ref);
        }
      }

      if (refs.size > 0) {
        await supabase.storage.from(STOCK_BUCKET).remove([...refs]);
      }
    }

    revalidateStock();
    return { ok: true, data: undefined };
  } catch (cause) {
    return failure(cause, "Não foi possível excluir o produto.");
  }
}

/**
 * Grava a nova ordem do catálogo.
 *
 * Recebe os ids já na sequência desejada; a posição no array vira o
 * `sort_order`, que é a mesma ordem usada no site público.
 */
export async function reorderItems(orderedIds: string[]): Promise<ActionResult> {
  if (orderedIds.length === 0) return { ok: true, data: undefined };

  try {
    const { supabase } = await requireAdmin();

    const results = await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("stock_items").update({ sort_order: index }).eq("id", id)
      )
    );

    const failed = results.find((result) => result.error);
    if (failed?.error) return { ok: false, error: failed.error.message };

    revalidateStock();
    return { ok: true, data: undefined };
  } catch (cause) {
    return failure(cause, "Não foi possível salvar a ordem.");
  }
}
