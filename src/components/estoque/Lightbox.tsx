"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { StockPhoto } from "./StockPhoto";
import type { StockImage } from "@/lib/stock/types";

/** Distância mínima do swipe para trocar de foto (px). */
const SWIPE_THRESHOLD = 50;

export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
  label,
}: {
  images: StockImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
  label: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const total = images.length;
  const current = images[index];

  const goTo = useCallback(
    (next: number) => onIndexChange((next + total) % total),
    [onIndexChange, total]
  );

  // Trava o scroll do fundo e devolve o foco de onde ele veio ao fechar.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
        return;
      }
      // Mantém o Tab preso ao diálogo enquanto ele estiver aberto.
      if (event.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [goTo, index, onClose]);

  // Só renderiza a partir de uma interação do usuário, então o document sempre
  // existe aqui; a guarda cobre apenas o caso de a lista chegar vazia.
  if (typeof document === "undefined" || !current) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria de ${label}`}
      className="fixed inset-0 z-[100] flex flex-col bg-ink/97 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        if (!start) return;
        touchStart.current = null;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        // Só conta como swipe horizontal se for claramente horizontal.
        if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
        goTo(index + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-4 md:px-6">
        <p className="font-body text-[13px] text-white/60">
          <span className="sr-only">Foto </span>
          {index + 1} <span className="text-white/30">/ {total}</span>
          <span className="ml-3 hidden text-white/40 sm:inline">
            {current.type === "result" ? "Peça produzida" : "Molde"}
          </span>
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar galeria"
          className="flex h-11 w-11 items-center justify-center rounded-full text-white/70 outline-none ring-teal transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-20">
        {total > 1 && (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Foto anterior"
            className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink/70 text-white outline-none ring-teal transition-colors hover:border-teal hover:bg-teal focus-visible:ring-2 md:left-5"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
        )}

        {/* key força o swap da imagem em vez de reaproveitar o <img> anterior,
            evitando a foto antiga esticada enquanto a nova decodifica. */}
        <StockPhoto
          key={current.base}
          image={current}
          sizes="(min-width: 768px) 90vw, 100vw"
          priority
          className="max-h-full max-w-full object-contain"
        />

        {total > 1 && (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Próxima foto"
            className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink/70 text-white outline-none ring-teal transition-colors hover:border-teal hover:bg-teal focus-visible:ring-2 md:right-5"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <p className="shrink-0 px-6 py-4 text-center font-body text-[13px] leading-relaxed text-white/55">
        {current.alt}
      </p>

      {total > 1 && (
        <div className="shrink-0 overflow-x-auto px-4 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max gap-2">
            {images.map((image, i) => (
              <button
                key={image.base}
                type="button"
                onClick={() => onIndexChange(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded border outline-none ring-teal transition-opacity focus-visible:ring-2 ${
                  i === index ? "border-teal opacity-100" : "border-white/15 opacity-45 hover:opacity-80"
                }`}
              >
                {/* Miniatura decorativa: o nome acessível vem do aria-label do
                    botão, e a foto já existe no documento com alt completo. Os
                    WebP são pré-gerados no build, então next/image só
                    acrescentaria uma transformação em runtime. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${image.base}-400.webp`}
                  alt=""
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  style={{ backgroundColor: image.color }}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
