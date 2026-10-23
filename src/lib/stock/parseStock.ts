/**
 * Fonte em arquivo: manifest gerado no build + curadoria → ItemSeed[].
 *
 * Esta é a fonte histórica do catálogo e continua valendo em dois casos:
 * enquanto o Supabase não estiver configurado (o site inteiro funciona sem
 * banco, exatamente como antes) e como entrada do script de importação.
 *
 * Nenhum dado é inventado aqui: tudo vem do nome da pasta, da contagem de
 * arquivos ou de curation.json.
 */

import manifest from "./catalog.generated.json";
import curationData from "./curation.json";
import type { ItemSeed, ImageSeed, Localized } from "./buildItem";
import type { CategoryKey } from "./taxonomy";
import type { StockItemKind, StockVariant } from "./types";

interface CuratedItem {
  name?: Localized;
  title?: Localized;
  subject?: Localized;
  kind?: StockItemKind;
  category?: CategoryKey;
  result?: string[];
  cover?: string;
  summary?: Localized;
}

interface ManifestImage {
  name: string;
  w: number;
  h: number;
  v: number[];
  color: string;
}

interface ManifestItem {
  slug: string;
  segment: string;
  source: string;
  images: ManifestImage[];
}

const curation = curationData as {
  exclude?: string[];
  institutional?: string;
  featured?: string[];
  items?: Record<string, CuratedItem>;
};

const CURATED = curation.items ?? {};
const INSTITUTIONAL_SLUG = curation.institutional ?? null;
const FEATURED = new Set(curation.featured ?? []);
const BASE_PATH = manifest.basePath ?? "/acervo";

/**
 * Derivativos do acervo: `/acervo/<slug>/<nome>-<largura>.webp`.
 *
 * O build nunca amplia o original, então uma foto de 960 px só existe até
 * 800 px — por isso o srcset sai da lista real `v`, e não de larguras fixas.
 */
function fileVariants(slug: string, image: ManifestImage): StockVariant[] {
  return image.v.map((width) => ({
    url: `${BASE_PATH}/${slug}/${image.name}-${width}.webp`,
    width,
  }));
}

function toSeed(entry: ManifestItem): ItemSeed {
  const curated: CuratedItem = CURATED[entry.slug] ?? {};
  const resultNames = new Set(curated.result ?? []);

  const images: ImageSeed[] = entry.images.map((image) => {
    const variants = fileVariants(entry.slug, image);
    return {
      id: `${entry.slug}/${image.name}`,
      name: image.name,
      src: variants[variants.length - 1]?.url ?? `${BASE_PATH}/${entry.slug}/${image.name}.webp`,
      variants,
      width: image.w,
      height: image.h,
      color: image.color,
      type: resultNames.has(image.name) ? "result" : "mold",
      isCover: curated.cover === image.name,
    };
  });

  // Sem `cover` na curadoria, a primeira foto de molde é a capa — mesma regra
  // de antes, só que agora explícita no seed.
  if (!images.some((image) => image.isCover)) {
    const first = images.find((image) => image.type === "mold") ?? images[0];
    if (first) first.isCover = true;
  }

  return {
    id: entry.slug,
    slug: entry.slug,
    segment: entry.segment,
    kind: curated.kind ?? "mold",
    // O acervo em arquivo não tem rascunho: tudo que está no manifest está no ar.
    status: "published",
    featured: FEATURED.has(entry.slug),
    sortOrder: 0,
    institutional: entry.slug === INSTITUTIONAL_SLUG,
    categoryKey: curated.category ?? null,
    cavities: null,
    volume: null,
    partWeight: null,
    name: curated.name,
    title: curated.title,
    subject: curated.subject,
    summary: curated.summary,
    updatedAt: null,
    images,
  };
}

/** Catálogo completo em arquivo, incluindo a galeria institucional. */
export function getFileSeeds(): ItemSeed[] {
  return (manifest.items as ManifestItem[]).map(toSeed);
}

/** Caminho da pasta de origem, usado pelo importador como chave idempotente. */
export function getFileSources(): Map<string, string> {
  return new Map(
    (manifest.items as ManifestItem[]).map((entry) => [entry.slug, entry.source])
  );
}
