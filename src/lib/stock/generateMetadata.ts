/**
 * Metadata e JSON-LD do estoque.
 *
 * Regra dura de Schema.org aqui: só entram campos que a 3WS realmente publica.
 * Preço, SKU, disponibilidade, marca, condição, GTIN e avaliação ficam de fora
 * porque esses dados não existem no acervo — Product sem oferta é válido e
 * honesto, Product com oferta inventada não é.
 */

import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import {
  LOCALES,
  LOCALE_TAGS,
  OG_LOCALES,
  localePath,
  t,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";
import { largestVariant } from "./imageUrl";
import { cavityLabelLower } from "./normalizeTitle";
import type { StockItem } from "./types";

export const STOCK_SEGMENT = "/estoque";

export function stockPath(locale: Locale) {
  return localePath(locale, STOCK_SEGMENT);
}

export function stockItemPath(locale: Locale, slug: string) {
  return localePath(locale, `${STOCK_SEGMENT}/${slug}`);
}

/**
 * hreflang para os três idiomas do mesmo conteúdo, mais x-default apontando
 * para o português — o idioma principal do negócio.
 */
export function languageAlternates(pathBuilder: (locale: Locale) => string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[LOCALE_TAGS[locale]] = pathBuilder(locale);
  }
  languages["x-default"] = pathBuilder("pt");
  return languages;
}

/** Descrição da página do molde: só fatos vindos da pasta. */
export function itemDescription(dict: Dictionary, item: StockItem): string {
  const tpl = dict.stock.templates;
  const parts: string[] = [];

  parts.push(
    item.kind === "collection"
      ? t(tpl.descCollection, { subject: item.subject })
      : t(tpl.descMold, { subject: item.subject })
  );

  if (item.cavities) {
    parts.push(t(tpl.descCavities, { cavities: cavityLabelLower(dict, item.cavities) }));
  }

  const count = item.images.length;
  const photos = `${count} ${
    count === 1 ? dict.stock.detail.photoCountOne : dict.stock.detail.photoCountMany
  }`;
  parts.push(
    item.resultImages.length > 0
      ? t(tpl.descPhotosBoth, { photos })
      : t(tpl.descPhotosMold, { photos })
  );

  return `${parts.join(", ")}. ${tpl.descTail}`;
}

export function buildItemMetadata(
  locale: Locale,
  dict: Dictionary,
  item: StockItem
): Metadata {
  const title = `${item.title} | ${SITE.name}`;
  const description = itemDescription(dict, item);
  const path = stockItemPath(locale, item.slug);
  const image = absoluteUrl(largestVariant(item.cover));

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: languageAlternates((l) => stockItemPath(l, item.slug)),
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE.name,
      locale: OG_LOCALES[locale],
      images: [{ url: image, alt: item.cover.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function itemBreadcrumbs(
  locale: Locale,
  dict: Dictionary,
  item: StockItem
): Crumb[] {
  return [
    { name: dict.common.home, path: localePath(locale) },
    { name: dict.header.nav.stock, path: stockPath(locale) },
    { name: item.category, path: `${stockPath(locale)}?categoria=${item.categoryKey}` },
    { name: item.shortTitle, path: stockItemPath(locale, item.slug) },
  ];
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE.url,
    logo: absoluteUrl(SITE.logo),
    email: SITE.email,
    telephone: `+${SITE.whatsapp}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
  };
}

export function collectionJsonLd(
  locale: Locale,
  dict: Dictionary,
  items: StockItem[],
  description: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: dict.stock.templates.seoCollectionName,
    description,
    url: absoluteUrl(stockPath(locale)),
    inLanguage: LOCALE_TAGS[locale],
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: absoluteUrl(stockItemPath(locale, item.slug)),
      })),
    },
  };
}

/** Product sem oferta: nome, fotos, categoria e descrição — nada inventado. */
export function productJsonLd(locale: Locale, dict: Dictionary, item: StockItem) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    description: itemDescription(dict, item),
    category: item.category,
    url: absoluteUrl(stockItemPath(locale, item.slug)),
    image: item.images.map((image) => ({
      "@type": "ImageObject",
      contentUrl: absoluteUrl(largestVariant(image)),
      caption: image.alt,
      representativeOfPage: image.name === item.cover.name,
    })),
    ...(item.cavities
      ? {
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: dict.stock.templates.cavityProperty,
              value: String(item.cavities),
            },
          ],
        }
      : {}),
  };
}
