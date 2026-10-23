/**
 * Montagem de um StockItem, independente de onde os dados vieram.
 *
 * O acervo em arquivo e o banco produzem a mesma estrutura intermediária
 * (`ItemSeed`) e passam por aqui. É o que garante que migrar a fonte não
 * mude uma vírgula do que o site renderiza: título, alt, busca, ordenação e
 * contagem saem todos deste arquivo.
 *
 * Nada é inventado: o que a origem não informa é derivado do slug (como
 * sempre foi) ou fica nulo.
 */

import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { generateMoldAlt, generateResultAlt } from "./generateAlt";
import { buildShortTitle, buildTitle, parseSlug } from "./normalizeTitle";
import {
  categoryRank,
  deriveCategoryKey,
  isCategoryKey,
  segmentKey,
  type CategoryKey,
} from "./taxonomy";
import type {
  Catalog,
  StockCategory,
  StockImage,
  StockImageType,
  StockItem,
  StockItemKind,
  StockStatus,
  StockVariant,
} from "./types";

/** Texto que pode vir por idioma ou como string única (aplicada aos três). */
export type Localized = string | Partial<Record<Locale, string>>;

export interface ImageSeed {
  id: string;
  name: string;
  src: string;
  variants: StockVariant[];
  width: number;
  height: number;
  color: string;
  type: StockImageType;
  isCover: boolean;
  /** Alt escrito à mão. Ausente = o alt contextual automático é usado. */
  alt?: Localized;
}

export interface ItemSeed {
  id: string;
  slug: string;
  segment: string;
  kind: StockItemKind;
  status: StockStatus;
  featured: boolean;
  sortOrder: number;
  institutional: boolean;
  /** Null = deriva do slug pelas regras de taxonomy.ts. */
  categoryKey: CategoryKey | null;
  /** Null = deriva do slug. */
  cavities: number | null;
  volume: string | null;
  partWeight: string | null;
  name?: Localized;
  title?: Localized;
  subject?: Localized;
  summary?: Localized;
  updatedAt: string | null;
  images: ImageSeed[];
}

/**
 * Sem tradução para este idioma, o português serve de fallback: mostrar o
 * nome original é melhor do que arriscar uma tradução automática errada.
 */
export function pick(value: Localized | undefined, locale: Locale): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  const chosen = value[locale] ?? value.pt;
  return chosen?.trim() || undefined;
}

export function buildItem(seed: ItemSeed, locale: Locale, dict: Dictionary): StockItem {
  const parsed = parseSlug(seed.slug);
  const kind = seed.kind;

  const name = pick(seed.name, locale) ?? parsed.base;
  const title = pick(seed.title, locale) ?? buildTitle(dict, name, kind, seed.cavities ?? parsed.cavities);
  const shortTitle = buildShortTitle(dict, name, seed.cavities ?? parsed.cavities);
  const subject = pick(seed.subject, locale) ?? name.toLocaleLowerCase(locale);

  const categoryKey =
    seed.categoryKey && isCategoryKey(seed.categoryKey)
      ? seed.categoryKey
      : deriveCategoryKey(seed.slug);
  const segment = segmentKey(seed.segment);
  const cavities = seed.cavities ?? parsed.cavities;

  // A posição usada no alt é relativa ao grupo (molde ou peça), para que a
  // primeira foto de cada bloco receba a descrição mais completa.
  let moldPosition = 0;
  let resultPosition = 0;

  const images: StockImage[] = seed.images.map((image) => {
    const isResult = image.type === "result";
    const position = isResult ? ++resultPosition : ++moldPosition;
    return {
      id: image.id,
      name: image.name,
      src: image.src,
      variants: image.variants,
      width: image.width,
      height: image.height,
      color: image.color,
      type: image.type,
      alt:
        pick(image.alt, locale) ??
        (isResult
          ? generateResultAlt({ dict, subject, position })
          : generateMoldAlt({ dict, subject, kind, cavities, position })),
    };
  });

  const moldImages = images.filter((image) => image.type === "mold");
  const resultImages = images.filter((image) => image.type === "result");

  const coverSeed = seed.images.find((image) => image.isCover);
  const cover =
    (coverSeed && images.find((image) => image.id === coverSeed.id)) ??
    moldImages[0] ??
    images[0];

  const searchText = [
    title,
    shortTitle,
    subject,
    dict.stock.categories[categoryKey],
    // O slug entra na busca em todos os idiomas: quem procura "copo" acha o
    // item mesmo navegando em inglês, e vice-versa.
    seed.slug.replace(/-/g, " "),
    parsed.base,
    dict.stock.segments[segment],
    cavities ? `${cavities}` : "",
    seed.volume ?? parsed.volume ?? "",
    seed.partWeight ?? parsed.partWeight ?? "",
    resultImages.length > 0 ? dict.stock.card.hasResult : "",
  ]
    .join(" ")
    .toLocaleLowerCase(locale);

  return {
    id: seed.id,
    slug: seed.slug,
    segment,
    segmentLabel: dict.stock.segments[segment],
    kind,
    status: seed.status,
    title,
    shortTitle,
    subject,
    categoryKey,
    category: dict.stock.categories[categoryKey],
    cavities,
    volume: seed.volume ?? parsed.volume,
    partWeight: seed.partWeight ?? parsed.partWeight,
    featured: seed.featured,
    sortOrder: seed.sortOrder,
    summary: pick(seed.summary, locale) ?? null,
    cover,
    images,
    moldImages,
    resultImages,
    updatedAt: seed.updatedAt,
    searchText,
  };
}

/**
 * Ordem do catálogo público.
 *
 * `sortOrder` é a preferência explícita do administrador e vem primeiro —
 * ordenação alfabética nunca sobrescreve o que foi definido arrastando. Os
 * critérios seguintes só desempatam itens com a mesma posição (o caso do
 * acervo em arquivo, onde todos são zero).
 */
export function sortCatalog(items: StockItem[], locale: Locale): StockItem[] {
  return [...items].sort((a, b) => {
    const byFeatured = Number(b.featured) - Number(a.featured);
    if (byFeatured !== 0) return byFeatured;
    const byOrder = a.sortOrder - b.sortOrder;
    if (byOrder !== 0) return byOrder;
    const byCategory = categoryRank(a.categoryKey) - categoryRank(b.categoryKey);
    if (byCategory !== 0) return byCategory;
    if (a.kind !== b.kind) return a.kind === "mold" ? -1 : 1;
    const byResult = Number(b.resultImages.length > 0) - Number(a.resultImages.length > 0);
    if (byResult !== 0) return byResult;
    return a.title.localeCompare(b.title, locale);
  });
}

export function buildCategories(items: StockItem[], dict: Dictionary): StockCategory[] {
  const counts = new Map<CategoryKey, number>();
  for (const item of items) {
    counts.set(item.categoryKey, (counts.get(item.categoryKey) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, name: dict.stock.categories[key], count }))
    .sort((a, b) => categoryRank(a.key) - categoryRank(b.key));
}

/**
 * Transforma a lista bruta de seeds no catálogo que o site consome.
 *
 * Só `published` chega ao público. A separação acontece aqui, uma única vez,
 * para catálogo, busca, páginas de detalhe, links relacionados e sitemap
 * concordarem por construção.
 */
export function assembleCatalog(
  seeds: ItemSeed[],
  locale: Locale,
  source: Catalog["source"]
): Catalog {
  const dict = getDictionary(locale);
  const all = seeds.map((seed) => ({ seed, item: buildItem(seed, locale, dict) }));

  // `institutional` é característica da origem, não do item renderizado: fica
  // no seed e some do StockItem, que é o que chega aos componentes.
  const institutional = all.find((entry) => entry.seed.institutional)?.item ?? null;
  const items = sortCatalog(
    all.filter((entry) => !entry.seed.institutional).map((entry) => entry.item),
    locale
  );
  const categories = buildCategories(items, dict);

  return {
    items,
    institutional,
    categories,
    totals: {
      items: items.length,
      photos: all.reduce((total, entry) => total + entry.item.images.length, 0),
      categories: categories.length,
      withResult: items.filter((item) => item.resultImages.length > 0).length,
    },
    error: null,
    source,
  };
}
