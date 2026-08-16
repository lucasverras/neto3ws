"use client";

import { useState } from "react";
import { Expand } from "lucide-react";
import { Lightbox } from "./Lightbox";
import { StockPhoto } from "./StockPhoto";
import { trackEvent } from "@/lib/analytics";
import type { StockImage } from "@/lib/stock/types";

// A grade é de 2 colunas no celular e 3 a partir de md — o `sizes` precisa
// refletir isso, senão o navegador baixa uma variante maior do que cabe.
const GALLERY_SIZES = "(min-width: 768px) 31vw, 45vw";

/**
 * Galeria da página do molde.
 *
 * Molde e peça produzida ficam em blocos separados com H2 próprio, mas o
 * lightbox percorre a sequência completa — o usuário que abriu na foto 3 não
 * fica preso a um bloco.
 */
export function MoldGallery({
  slug,
  label,
  moldImages,
  resultImages,
}: {
  slug: string;
  label: string;
  moldImages: StockImage[];
  resultImages: StockImage[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const all = [...moldImages, ...resultImages];

  const open = (image: StockImage) => {
    setOpenIndex(all.indexOf(image));
    trackEvent("stock_gallery_open", { slug, photo: image.name, type: image.type });
  };

  return (
    <>
      <section aria-labelledby="galeria-molde">
        <h2
          id="galeria-molde"
          className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl"
        >
          {resultImages.length > 0 ? "Molde" : "Galeria do molde"}
        </h2>
        <p className="mt-2 font-body text-[15px] text-white/50">
          {moldImages.length} {moldImages.length === 1 ? "foto" : "fotos"} — clique para
          ampliar
        </p>
        <PhotoGrid images={moldImages} onOpen={open} priorityCount={2} />
      </section>

      {resultImages.length > 0 && (
        <section aria-labelledby="galeria-peca" className="mt-16">
          <h2
            id="galeria-peca"
            className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl"
          >
            Peça produzida
          </h2>
          <p className="mt-2 max-w-2xl font-body text-[15px] leading-relaxed text-white/50">
            Peças injetadas neste molde, registradas pela equipe da 3WS.
          </p>
          <PhotoGrid images={resultImages} onOpen={open} priorityCount={0} />
        </section>
      )}

      {openIndex !== null && (
        <Lightbox
          images={all}
          index={openIndex}
          label={label}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}

function PhotoGrid({
  images,
  onOpen,
  priorityCount,
}: {
  images: StockImage[];
  onOpen: (image: StockImage) => void;
  priorityCount: number;
}) {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
      {images.map((image, index) => (
        <li key={image.base}>
          <button
            type="button"
            onClick={() => onOpen(image)}
            aria-label={`Ampliar: ${image.alt}`}
            className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-white/10 bg-navy-soft outline-none ring-teal focus-visible:ring-2"
          >
            <StockPhoto
              image={image}
              sizes={GALLERY_SIZES}
              maxWidth={800}
              priority={index < priorityCount}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              <Expand size={20} strokeWidth={1.5} className="text-white" />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
