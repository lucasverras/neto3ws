/**
 * Monta o catálogo em memória: manifest gerado + curadoria → StockItem[].
 *
 * Roda só no servidor, em build time (as páginas do estoque são estáticas), e
 * o resultado é memoizado no módulo. Nenhum dado é inventado aqui: tudo vem do
 * nome da pasta, da contagem de arquivos ou de curation.json.
 */

import manifest from "./catalog.generated.json";
import curationData from "./curation.json";
import { generateMoldAlt, generateResultAlt } from "./generateAlt";
import {
  buildSubject,
  buildTitle,
  parseSlug,
  toShortTitle,
  toSlug,
} from "./normalizeTitle";
import { categoryRank, deriveCategory, segmentLabel } from "./taxonomy";
import type { StockCategory, StockImage, StockItem, StockItemKind } from "./types";

interface CuratedItem {
  title?: string;
  subject?: string;
  kind?: StockItemKind;
  category?: string;
  result?: string[];
  cover?: string;
  summary?: string;
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
  items?: Record<string, CuratedItem>;
};

const CURATED = curation.items ?? {};
const INSTITUTIONAL_SLUG = curation.institutional ?? null;
const BASE_PATH = manifest.basePath ?? "/estoque";

function buildItem(entry: ManifestItem): StockItem {
  const curated: CuratedItem = CURATED[entry.slug] ?? {};
  const parsed = parseSlug(entry.slug);
  const kind: StockItemKind = curated.kind ?? "mold";

  const title = curated.title ?? buildTitle(parsed, kind);
  const subject = curated.subject ?? buildSubject(parsed);
  const category = curated.category ?? deriveCategory(entry.slug);
  const resultNames = new Set(curated.result ?? []);

  // A posição usada no alt é relativa ao grupo (molde ou peça), para que a
  // primeira foto de cada bloco receba a descrição mais completa.
  let moldPosition = 0;
  let resultPosition = 0;

  const images: StockImage[] = entry.images.map((image) => {
    const isResult = resultNames.has(image.name);
    const position = isResult ? ++resultPosition : ++moldPosition;
    return {
      name: image.name,
      base: `${BASE_PATH}/${entry.slug}/${image.name}`,
      width: image.w,
      height: image.h,
      widths: image.v,
      color: image.color,
      type: isResult ? "result" : "mold",
      alt: isResult
        ? generateResultAlt({ subject, position })
        : generateMoldAlt({ subject, kind, cavities: parsed.cavities, position }),
    };
  });

  const moldImages = images.filter((image) => image.type === "mold");
  const resultImages = images.filter((image) => image.type === "result");

  const cover =
    images.find((image) => image.name === curated.cover) ?? moldImages[0] ?? images[0];

  const searchText = [
    title,
    subject,
    category,
    entry.slug.replace(/-/g, " "),
    segmentLabel(entry.segment),
    parsed.cavities ? `${parsed.cavities} cavidades ${parsed.cavities} cavidade` : "",
    parsed.volume ?? "",
    parsed.partWeight ?? "",
    resultImages.length > 0 ? "peça produzida peça injetada resultado" : "",
    "molde molde de injeção injeção plástica usado",
  ]
    .join(" ")
    .toLocaleLowerCase("pt-BR");

  return {
    slug: entry.slug,
    segment: entry.segment,
    segmentLabel: segmentLabel(entry.segment),
    kind,
    title,
    shortTitle: toShortTitle(title),
    subject,
    category,
    categorySlug: toSlug(category),
    cavities: parsed.cavities,
    volume: parsed.volume,
    partWeight: parsed.partWeight,
    summary: curated.summary ?? null,
    cover,
    images,
    moldImages,
    resultImages,
    searchText,
  };
}

const ALL_ITEMS: StockItem[] = (manifest.items as ManifestItem[]).map(buildItem);

/**
 * Pasta institucional (acervo geral): vira prova visual do estoque, não um
 * produto. Fica fora do grid e das URLs de molde.
 */
export const INSTITUTIONAL_ITEM: StockItem | null =
  ALL_ITEMS.find((item) => item.slug === INSTITUTIONAL_SLUG) ?? null;

/** Ordena por categoria e, dentro dela, pelos itens com mais material primeiro. */
function compareItems(a: StockItem, b: StockItem) {
  const byCategory = categoryRank(a.category) - categoryRank(b.category);
  if (byCategory !== 0) return byCategory;
  if (a.kind !== b.kind) return a.kind === "mold" ? -1 : 1;
  const byResult = Number(b.resultImages.length > 0) - Number(a.resultImages.length > 0);
  if (byResult !== 0) return byResult;
  return a.title.localeCompare(b.title, "pt-BR");
}

export const STOCK_ITEMS: StockItem[] = ALL_ITEMS.filter(
  (item) => item.slug !== INSTITUTIONAL_SLUG
).sort(compareItems);

export function getStockItem(slug: string): StockItem | undefined {
  return STOCK_ITEMS.find((item) => item.slug === slug);
}

export function getStockCategories(): StockCategory[] {
  const counts = new Map<string, number>();
  for (const item of STOCK_ITEMS) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: toSlug(name), count }))
    .sort((a, b) => {
      const byOrder = categoryRank(a.name) - categoryRank(b.name);
      return byOrder !== 0 ? byOrder : a.name.localeCompare(b.name, "pt-BR");
    });
}

/** Outros moldes da mesma categoria — links internos reais entre as páginas. */
export function getRelatedItems(item: StockItem, limit = 4): StockItem[] {
  const sameCategory = STOCK_ITEMS.filter(
    (candidate) => candidate.slug !== item.slug && candidate.category === item.category
  );
  const fallback = STOCK_ITEMS.filter(
    (candidate) => candidate.slug !== item.slug && candidate.category !== item.category
  );
  return [...sameCategory, ...fallback].slice(0, limit);
}

export const STOCK_TOTALS = {
  items: STOCK_ITEMS.length,
  photos: ALL_ITEMS.reduce((total, item) => total + item.images.length, 0),
  categories: getStockCategories().length,
  withResult: STOCK_ITEMS.filter((item) => item.resultImages.length > 0).length,
};
