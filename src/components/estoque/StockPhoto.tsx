import { cn } from "@/lib/utils";
import type { StockImage } from "@/lib/stock/types";

/**
 * Foto do acervo.
 *
 * Usa <img> nativo com srcset apontando para os WebP já gerados no build, em
 * vez de next/image: as três larguras são conhecidas em build time, então o
 * otimizador em runtime não acrescentaria nada e cobraria uma transformação
 * por foto. O resultado é semanticamente correto para o Google Imagens
 * (elemento <img> real, nunca background-image), com dimensões declaradas
 * para não causar CLS.
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
  const widths = maxWidth ? image.widths.filter((w) => w <= maxWidth) : image.widths;
  const usable = widths.length > 0 ? widths : [image.widths[0]];
  const fallback = usable[usable.length - 1];

  return (
    // eslint-disable-next-line @next/next/no-img-element -- ver comentário do componente
    <img
      src={`${image.base}-${fallback}.webp`}
      srcSet={usable.map((w) => `${image.base}-${w}.webp ${w}w`).join(", ")}
      sizes={sizes}
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
