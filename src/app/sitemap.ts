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

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: absoluteUrl(localePath(locale)),
      changeFrequency: "monthly",
      priority: 1,
      alternates: alternates((l) => localePath(l)),
    });
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
  if (entries.length !== LOCALES.length * (2 + getStockSlugs().length)) {
    throw new Error("Sitemap incompleto: os idiomas divergiram no catálogo.");
  }

  return entries;
}
