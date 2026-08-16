import type { StockImage } from "./types";

/**
 * URL da maior versão realmente gerada para uma foto.
 *
 * Nem toda foto tem os 1400 px: o build nunca amplia o original, então uma foto
 * de 960 px só existe até 800 px. Metadata, JSON-LD e sitemap precisam apontar
 * para um arquivo que existe — daí este helper em vez de fixar a largura.
 */
export function largestVariant(image: StockImage): string {
  const width = image.widths[image.widths.length - 1] ?? image.widths[0];
  return `${image.base}-${width}.webp`;
}
