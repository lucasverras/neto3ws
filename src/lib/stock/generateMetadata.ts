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
import { largestVariant } from "./imageUrl";
import { cavityLabelLower } from "./normalizeTitle";
import type { StockItem } from "./types";

export const STOCK_PATH = "/estoque";

export function stockItemPath(slug: string) {
  return `${STOCK_PATH}/${slug}`;
}

/** Descrição da página do molde: só fatos vindos da pasta. */
export function itemDescription(item: StockItem): string {
  const parts: string[] = [];

  if (item.kind === "collection") {
    parts.push(`Acervo de moldes de injeção plástica para ${item.subject} disponível na 3WS`);
  } else {
    parts.push(`Molde de injeção plástica para ${item.subject} no estoque da 3WS`);
  }

  if (item.cavities) parts.push(`com ${cavityLabelLower(item.cavities)}`);

  const photos = `${item.images.length} ${item.images.length === 1 ? "foto" : "fotos"}`;
  parts.push(
    item.resultImages.length > 0
      ? `${photos} do molde e da peça produzida`
      : `${photos} do molde`
  );

  return `${parts.join(", ")}. Consulte disponibilidade e condições comerciais.`;
}

export function buildItemMetadata(item: StockItem): Metadata {
  const title = `${item.title} | ${SITE.name}`;
  const description = itemDescription(item);
  const path = stockItemPath(item.slug);
  const image = absoluteUrl(largestVariant(item.cover));

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE.name,
      locale: "pt_BR",
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

export function itemBreadcrumbs(item: StockItem): Crumb[] {
  return [
    { name: "Início", path: "/" },
    { name: "Estoque", path: STOCK_PATH },
    { name: item.category, path: `${STOCK_PATH}?categoria=${item.categorySlug}` },
    { name: item.shortTitle, path: stockItemPath(item.slug) },
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

export function collectionJsonLd(items: StockItem[], description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Estoque de moldes de injeção plástica — ${SITE.name}`,
    description,
    url: absoluteUrl(STOCK_PATH),
    inLanguage: "pt-BR",
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: absoluteUrl(stockItemPath(item.slug)),
      })),
    },
  };
}

/** Product sem oferta: nome, fotos, categoria e descrição — nada inventado. */
export function productJsonLd(item: StockItem) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    description: itemDescription(item),
    category: item.category,
    url: absoluteUrl(stockItemPath(item.slug)),
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
              name: "Número de cavidades",
              value: String(item.cavities),
            },
          ],
        }
      : {}),
  };
}
