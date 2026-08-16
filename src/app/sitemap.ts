import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import { STOCK_ITEMS } from "@/lib/stock/parseStock";
import { STOCK_PATH, stockItemPath } from "@/lib/stock/generateMetadata";
import { largestVariant } from "@/lib/stock/imageUrl";

/**
 * Sitemap gerado a partir do mesmo catálogo que alimenta as páginas — uma pasta
 * nova no acervo entra aqui sozinha. As fotos vão junto no campo `images`, que
 * é o formato de image sitemap que o Google Imagens consome.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl(STOCK_PATH),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...STOCK_ITEMS.map((item) => ({
      url: absoluteUrl(stockItemPath(item.slug)),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: item.images.map((image) => absoluteUrl(largestVariant(image))),
    })),
  ];
}
