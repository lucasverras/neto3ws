"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StockPhoto } from "./StockPhoto";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary, Locale } from "@/lib/i18n";
import { cavityLabel } from "@/lib/stock/normalizeTitle";
import { stockItemPath } from "@/lib/stock/generateMetadata";
import type { StockItem } from "@/lib/stock/types";

const CARD_SIZES = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw";

export function StockCard({
  item,
  locale,
  dict,
  priority = false,
}: {
  item: StockItem;
  locale: Locale;
  dict: Dictionary;
  priority?: boolean;
}) {
  const d = dict.stock;
  const count = item.images.length;
  const photoLabel = `${count} ${
    count === 1 ? d.detail.photoCountOne : d.detail.photoCountMany
  }`;

  return (
    <article className="group relative">
      <Link
        href={stockItemPath(locale, item.slug)}
        onClick={() => trackEvent("stock_item_open", { slug: item.slug, category: item.categoryKey })}
        className="block rounded-lg outline-none ring-teal transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        <div className="relative aspect-4/5 overflow-hidden rounded-lg border border-white/10 bg-navy-soft">
          <StockPhoto
            image={item.cover}
            sizes={CARD_SIZES}
            maxWidth={800}
            priority={priority}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"
          />

          {/* Os dois selos ficam em cantos opostos na vertical: lado a lado no
              topo eles se sobrepõem no card de 2 colunas do celular. */}
          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-ink/70 px-2.5 py-1 font-body text-[11px] uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm sm:px-3 sm:tracking-[0.18em]">
            {item.kind === "collection" ? d.card.collection : d.card.mold}
          </span>

          {item.resultImages.length > 0 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-teal/90 px-2.5 py-1 font-body text-[11px] font-medium uppercase tracking-[0.1em] text-white sm:px-3 sm:tracking-[0.14em]">
              {d.card.hasResult}
            </span>
          )}

          {/* "Ver molde" só aparece no hover em ponteiro fino; no toque o card
              inteiro já é o link, então nada fica escondido atrás de hover. */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 font-body text-[11px] font-medium uppercase tracking-[0.14em] text-ink opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 lg:flex lg:translate-y-2"
          >
            {d.card.view}
            <ArrowUpRight size={13} strokeWidth={2} />
          </span>
        </div>

        <div className="mt-4 transition-transform duration-300 ease-out lg:group-hover:-translate-y-0.5">
          <p className="font-body text-[11px] uppercase tracking-[0.18em] text-teal">
            {item.category}
          </p>
          <h3 className="mt-1.5 font-display text-[15px] font-medium leading-snug tracking-tight text-white sm:text-lg">
            {item.shortTitle}
          </h3>
          <p className="mt-1 font-body text-[13px] leading-relaxed text-white/45">
            {item.cavities ? `${cavityLabel(dict, item.cavities)} · ` : ""}
            {photoLabel}
            {item.resultImages.length > 0 ? ` · ${d.card.moldPlusPart}` : ""}
          </p>
        </div>
      </Link>
    </article>
  );
}
