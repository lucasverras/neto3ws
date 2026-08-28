import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { LOCALES, LOCALE_TAGS, localePath } from "@/lib/i18n";
import { getStockItems, getStockSlugs } from "@/lib/stock/parseStock";
import { stockItemPath, stockPath } from "@/lib/stock/generateMetadata";
import { largestVariant } from "@/lib/stock/imageUrl";

/**
 * Sitemap gerado a partir do mesmo catálogo que alimenta as páginas — uma pasta
 * nova no acervo entra aqui sozinha, nos três idiomas.
 *
 * Cada URL declara as alternativas de idioma em `alternates.languages`, que é o
 * que o Google usa para agrupar as três versões em vez de tratá-las como
 * conteúdo duplicado. As fotos vão no campo `images`, o formato de image
 * sitemap que o Google Imagens consome.
 */
function alternates(build: (locale: (typeof LOCALES)[number]) => string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) languages[LOCALE_TAGS[locale]] = absoluteUrl(build(locale));
  return { languages };
}

const STATIC_PAGES = [
  { path: "/quem-somos", priority: 0.8 as const, changeFrequency: "monthly" as const },
  { path: "/servicos", priority: 0.8 as const, changeFrequency: "monthly" as const },
  { path: "/contato", priority: 0.7 as const, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: absoluteUrl(localePath(locale)),
      changeFrequency: "monthly",
      priority: 1,
      alternates: alternates((l) => localePath(l)),
    });

    for (const page of STATIC_PAGES) {
      entries.push({
        url: absoluteUrl(localePath(locale, page.path)),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: alternates((l) => localePath(l, page.path)),
      });
    }

    entries.push({
      url: absoluteUrl(stockPath(locale)),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: alternates((l) => stockPath(l)),
    });
  }

  // As fotos são as mesmas nos três idiomas, mas o alt/caption muda — o
  // catálogo é lido por idioma para o sitemap refletir a página real.
  for (const locale of LOCALES) {
    for (const item of getStockItems(locale)) {
      entries.push({
        url: absoluteUrl(stockItemPath(locale, item.slug)),
        changeFrequency: "monthly",
        priority: 0.7,
        images: item.images.map((image) => absoluteUrl(largestVariant(image))),
        alternates: alternates((l) => stockItemPath(l, item.slug)),
      });
    }
  }

  // Confere que os três idiomas cobrem exatamente o mesmo conjunto de moldes.
  const expectedPerLocale = 1 + STATIC_PAGES.length + 1 + getStockSlugs().length;
  if (entries.length !== LOCALES.length * expectedPerLocale) {
    throw new Error("Sitemap incompleto: os idiomas divergiram no catálogo.");
  }

  return entries;
}
