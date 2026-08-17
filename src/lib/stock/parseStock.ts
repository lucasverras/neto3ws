/**
 * Monta o catálogo em memória: manifest gerado + curadoria → StockItem[].
 *
 * Roda só no servidor, em build time (as páginas do estoque são estáticas). O
 * resultado é memoizado por idioma. Nenhum dado é inventado aqui: tudo vem do
 * nome da pasta, da contagem de arquivos ou de curation.json.
 */

import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import manifest from "./catalog.generated.json";
import curationData from "./curation.json";
import { generateMoldAlt, generateResultAlt } from "./generateAlt";
import { buildShortTitle, buildTitle, parseSlug } from "./normalizeTitle";
import {
  categoryRank,
  deriveCategoryKey,
  segmentKey,
  type CategoryKey,
} from "./taxonomy";
import type { StockCategory, StockImage, StockItem, StockItemKind } from "./types";

/** Texto que pode vir por idioma ou como string única (aplicada aos três). */
type Localized = string | Partial<Record<Locale, string>>;

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
  items?: Record<string, CuratedItem>;
};

const CURATED = curation.items ?? {};
const INSTITUTIONAL_SLUG = curation.institutional ?? null;
const BASE_PATH = manifest.basePath ?? "/estoque";

function pick(value: Localized | undefined, locale: Locale): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  // Sem tradução para este idioma, o português serve de fallback: mostrar o
  // nome original é melhor do que arriscar uma tradução automática errada.
  return value[locale] ?? value.pt;
}

function buildItem(entry: ManifestItem, locale: Locale, dict: Dictionary): StockItem {
  const curated: CuratedItem = CURATED[entry.slug] ?? {};
  const parsed = parseSlug(entry.slug);
  const kind: StockItemKind = curated.kind ?? "mold";

  const name = pick(curated.name, locale) ?? parsed.base;
  const title = pick(curated.title, locale) ?? buildTitle(dict, name, kind, parsed.cavities);
  const shortTitle = buildShortTitle(dict, name, parsed.cavities);
  const subject = pick(curated.subject, locale) ?? name.toLocaleLowerCase(locale);

  const categoryKey = curated.category ?? deriveCategoryKey(entry.slug);
  const segment = segmentKey(entry.segment);
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
        ? generateResultAlt({ dict, subject, position })
        : generateMoldAlt({ dict, subject, kind, cavities: parsed.cavities, position }),
    };
  });

  const moldImages = images.filter((image) => image.type === "mold");
  const resultImages = images.filter((image) => image.type === "result");
  const cover =
    images.find((image) => image.name === curated.cover) ?? moldImages[0] ?? images[0];

  const searchText = [
    title,
    shortTitle,
    subject,
    dict.stock.categories[categoryKey],
    // O slug entra na busca em todos os idiomas: quem procura "copo" acha o
    // item mesmo navegando em inglês, e vice-versa.
    entry.slug.replace(/-/g, " "),
    parsed.base,
    dict.stock.segments[segment],
    parsed.cavities ? `${parsed.cavities}` : "",
    parsed.volume ?? "",
    parsed.partWeight ?? "",
    resultImages.length > 0 ? dict.stock.card.hasResult : "",
  ]
    .join(" ")
    .toLocaleLowerCase(locale);

  return {
    slug: entry.slug,
    segment,
    segmentLabel: dict.stock.segments[segment],
    kind,
    title,
    shortTitle,
    subject,
    categoryKey,
    category: dict.stock.categories[categoryKey],
    cavities: parsed.cavities,
    volume: parsed.volume,
    partWeight: parsed.partWeight,
    summary: pick(curated.summary, locale) ?? null,
    cover,
    images,
    moldImages,
    resultImages,
    searchText,
  };
}

interface Catalog {
  items: StockItem[];
  institutional: StockItem | null;
  categories: StockCategory[];
  totals: { items: number; photos: number; categories: number; withResult: number };
}

const CACHE = new Map<Locale, Catalog>();

function buildCatalog(locale: Locale): Catalog {
  const dict = getDictionary(locale);
  const all = (manifest.items as ManifestItem[]).map((entry) => buildItem(entry, locale, dict));

  const institutional = all.find((item) => item.slug === INSTITUTIONAL_SLUG) ?? null;

  const items = all
    .filter((item) => item.slug !== INSTITUTIONAL_SLUG)
    .sort((a, b) => {
      const byCategory = categoryRank(a.categoryKey) - categoryRank(b.categoryKey);
      if (byCategory !== 0) return byCategory;
      if (a.kind !== b.kind) return a.kind === "mold" ? -1 : 1;
      const byResult = Number(b.resultImages.length > 0) - Number(a.resultImages.length > 0);
      if (byResult !== 0) return byResult;
      return a.title.localeCompare(b.title, locale);
    });

  const counts = new Map<CategoryKey, number>();
  for (const item of items) {
    counts.set(item.categoryKey, (counts.get(item.categoryKey) ?? 0) + 1);
  }
  const categories: StockCategory[] = [...counts.entries()]
    .map(([key, count]) => ({ key, name: dict.stock.categories[key], count }))
    .sort((a, b) => categoryRank(a.key) - categoryRank(b.key));

  return {
    items,
    institutional,
    categories,
    totals: {
      items: items.length,
      photos: all.reduce((total, item) => total + item.images.length, 0),
      categories: categories.length,
      withResult: items.filter((item) => item.resultImages.length > 0).length,
    },
  };
}

export function getCatalog(locale: Locale): Catalog {
  let catalog = CACHE.get(locale);
  if (!catalog) {
    catalog = buildCatalog(locale);
    CACHE.set(locale, catalog);
  }
  return catalog;
}

export function getStockItems(locale: Locale): StockItem[] {
  return getCatalog(locale).items;
}

export function getStockItem(locale: Locale, slug: string): StockItem | undefined {
  return getCatalog(locale).items.find((item) => item.slug === slug);
}

export function getStockCategories(locale: Locale): StockCategory[] {
  return getCatalog(locale).categories;
}

export function getInstitutionalItem(locale: Locale): StockItem | null {
  return getCatalog(locale).institutional;
}

/** Slugs do catálogo — iguais em todos os idiomas, então independem de locale. */
export function getStockSlugs(): string[] {
  return (manifest.items as ManifestItem[])
    .filter((entry) => entry.slug !== INSTITUTIONAL_SLUG)
    .map((entry) => entry.slug);
}

/** Outros moldes da mesma categoria — links internos reais entre as páginas. */
export function getRelatedItems(locale: Locale, item: StockItem, limit = 4): StockItem[] {
  const items = getStockItems(locale);
  const sameCategory = items.filter(
    (candidate) => candidate.slug !== item.slug && candidate.categoryKey === item.categoryKey
  );
  const fallback = items.filter(
    (candidate) => candidate.slug !== item.slug && candidate.categoryKey !== item.categoryKey
  );
  return [...sameCategory, ...fallback].slice(0, limit);
}
