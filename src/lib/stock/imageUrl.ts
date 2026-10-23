import type { StockImage } from "./types";

/**
 * URL da maior versão que realmente existe para uma foto.
 *
 * Nem toda foto tem a escada completa: o build do acervo nunca amplia o
 * original (uma foto de 960 px só existe até 800 px) e um upload pelo painel
 * grava apenas as larguras que cabiam na imagem enviada. Metadata, JSON-LD e
 * sitemap precisam apontar para um arquivo que existe — daí este helper em
 * vez de fixar a largura.
 */
export function largestVariant(image: StockImage): string {
  return image.variants[image.variants.length - 1]?.url ?? image.src;
}

/** Menor versão existente — miniaturas do painel e do lightbox. */
export function smallestVariant(image: StockImage): string {
  return image.variants[0]?.url ?? image.src;
}
