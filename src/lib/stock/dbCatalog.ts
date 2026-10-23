/**
 * Fonte Supabase: linhas do banco → ItemSeed[].
 *
 * Converte o formato do Postgres para a mesma estrutura que o acervo em
 * arquivo produz, para que `buildItem` monte itens idênticos vindos de
 * qualquer origem.
 */

import { STOCK_BUCKET, supabaseUrl } from "@/lib/supabase/env";
import type { ImageSeed, ItemSeed, Localized } from "./buildItem";
import { isStockStatus, type StockItemKind, type StockVariant } from "./types";

/** Colunas lidas pelo site público. `internal_notes` fica de fora de propósito. */
export const PUBLIC_ITEM_COLUMNS =
  "id, slug, segment, category_key, kind, status, featured, sort_order, cavities, volume, part_weight, name, title, subject, summary, institutional, legacy_source, created_at, updated_at";

/** O painel vê tudo, inclusive as observações internas. */
export const ADMIN_ITEM_COLUMNS = `${PUBLIC_ITEM_COLUMNS}, internal_notes`;

export const IMAGE_COLUMNS =
  "id, item_id, type, source, variants, width, height, color, is_cover, sort_order, alt, file_name";

export interface StockItemRow {
  id: string;
  slug: string;
  segment: string | null;
  category_key: string | null;
  kind: string | null;
  status: string | null;
  featured: boolean | null;
  sort_order: number | null;
  cavities: number | null;
  volume: string | null;
  part_weight: string | null;
  name: Record<string, string> | null;
  title: Record<string, string> | null;
  subject: Record<string, string> | null;
  summary: Record<string, string> | null;
  institutional: boolean | null;
  legacy_source: string | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockImageRow {
  id: string;
  item_id: string;
  type: string | null;
  source: string | null;
  variants: { w: number; ref: string }[] | null;
  width: number;
  height: number;
  color: string | null;
  is_cover: boolean | null;
  sort_order: number | null;
  alt: Record<string, string> | null;
  file_name: string | null;
}

/**
 * URL pública de um objeto do bucket.
 *
 * Montada à mão em vez de via `getPublicUrl()` para que o sitemap e os
 * metadados possam ser gerados sem instanciar um cliente — o formato é
 * estável e documentado pelo Supabase.
 */
export function storagePublicUrl(ref: string): string {
  return `${supabaseUrl()}/storage/v1/object/public/${STOCK_BUCKET}/${ref
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/**
 * Resolve as variantes REAIS da foto.
 *
 * Legado aponta direto para `/acervo/...`, gerado no build. Foto do painel
 * aponta para o bucket. Em nenhum dos dois casos uma largura é presumida: se
 * o upload gravou um arquivo só, o srcset tem uma entrada só.
 */
function resolveVariants(row: StockImageRow): StockVariant[] {
  const raw = Array.isArray(row.variants) ? row.variants : [];
  const legacy = row.source === "legacy";
  return raw
    .filter((variant) => variant && typeof variant.ref === "string" && variant.w > 0)
    .map((variant) => ({
      width: variant.w,
      url: legacy ? variant.ref : storagePublicUrl(variant.ref),
    }))
    .sort((a, b) => a.width - b.width);
}

function localized(value: Record<string, string> | null): Localized | undefined {
  if (!value) return undefined;
  const entries = Object.entries(value).filter(([, text]) => text?.trim());
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function toImageSeed(row: StockImageRow): ImageSeed | null {
  const variants = resolveVariants(row);
  // Sem nenhuma variante a foto não tem URL servível. Descartar é melhor do
  // que renderizar um <img> quebrado na página pública.
  if (variants.length === 0) return null;

  return {
    id: row.id,
    name: row.file_name ?? row.id.slice(0, 8),
    src: variants[variants.length - 1].url,
    variants,
    width: row.width,
    height: row.height,
    color: row.color ?? "#041c44",
    type: row.type === "result" ? "result" : "mold",
    isCover: row.is_cover === true,
    alt: localized(row.alt),
  };
}

export function toItemSeed(row: StockItemRow, imageRows: StockImageRow[]): ItemSeed {
  const images = imageRows
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(toImageSeed)
    .filter((image): image is ImageSeed => image !== null);

  if (images.length > 0 && !images.some((image) => image.isCover)) {
    const first = images.find((image) => image.type === "mold") ?? images[0];
    first.isCover = true;
  }

  const kind: StockItemKind = row.kind === "collection" ? "collection" : "mold";
  const status = row.status && isStockStatus(row.status) ? row.status : "draft";

  return {
    id: row.id,
    slug: row.slug,
    segment: row.segment ?? "outros",
    kind,
    status,
    featured: row.featured === true,
    sortOrder: row.sort_order ?? 0,
    institutional: row.institutional === true,
    categoryKey: (row.category_key as ItemSeed["categoryKey"]) ?? null,
    cavities: row.cavities,
    volume: row.volume,
    partWeight: row.part_weight,
    name: localized(row.name),
    title: localized(row.title),
    subject: localized(row.subject),
    summary: localized(row.summary),
    updatedAt: row.updated_at,
    images,
  };
}

/** Junta itens e fotos vindos de duas queries numa lista de seeds. */
export function toItemSeeds(items: StockItemRow[], images: StockImageRow[]): ItemSeed[] {
  const byItem = new Map<string, StockImageRow[]>();
  for (const image of images) {
    const list = byItem.get(image.item_id);
    if (list) list.push(image);
    else byItem.set(image.item_id, [image]);
  }
  return items.map((item) => toItemSeed(item, byItem.get(item.id) ?? []));
}
