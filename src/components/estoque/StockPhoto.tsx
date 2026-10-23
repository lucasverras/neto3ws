import { cn } from "@/lib/utils";
import type { StockImage } from "@/lib/stock/types";

/**
 * Foto do acervo.
 *
 * Usa <img> nativo com srcset apontando para arquivos que já existem, em vez
 * de next/image: as larguras são conhecidas (geradas no build do acervo ou
 * no upload do painel), então o otimizador em runtime não acrescentaria nada
 * e cobraria uma transformação por foto. O resultado é semanticamente correto
 * para o Google Imagens (elemento <img> real, nunca background-image), com
 * dimensões declaradas para não causar CLS.
 *
 * O srcset sai de `image.variants`, que lista apenas o que foi mesmo gerado.
 * Uma foto com uma variante só sai sem srcset — melhor do que oferecer ao
 * navegador uma URL que daria 404.
 */
export function StockPhoto({
  image,
  sizes,
  priority = false,
  className,
  imgClassName,
  /** Maior largura que faz sentido baixar neste contexto. */
  maxWidth,
}: {
  image: StockImage;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  maxWidth?: number;
}) {
  const capped = maxWidth
    ? image.variants.filter((variant) => variant.width <= maxWidth)
    : image.variants;
  // Nunca fica sem nada: se o corte removeu tudo, a menor variante serve.
  const usable = capped.length > 0 ? capped : image.variants.slice(0, 1);
  const fallback = usable[usable.length - 1];

  return (
    // eslint-disable-next-line @next/next/no-img-element -- ver comentário do componente
    <img
      src={fallback?.url ?? image.src}
      srcSet={
        usable.length > 1
          ? usable.map((variant) => `${variant.url} ${variant.width}w`).join(", ")
          : undefined
      }
      sizes={usable.length > 1 ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      style={{ backgroundColor: image.color }}
      className={cn(className, imgClassName)}
    />
  );
}
