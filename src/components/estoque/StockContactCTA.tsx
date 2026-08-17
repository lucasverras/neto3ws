"use client";

import { trackEvent } from "@/lib/analytics";
import { t, type Dictionary } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/site";
import type { StockItem } from "@/lib/stock/types";

/** CTA da página do molde, com a mensagem do WhatsApp já preenchida. */
export function StockContactCTA({ item, dict }: { item: StockItem; dict: Dictionary }) {
  const d = dict.stock.detail;
  const message = t(d.ctaMessage, { title: item.shortTitle });

  return (
    <section
      aria-labelledby="cta-molde"
      className="rounded-lg border border-white/12 bg-white/[0.03] px-6 py-10 md:px-10 md:py-12"
    >
      <h2
        id="cta-molde"
        className="font-display text-2xl font-medium leading-tight tracking-tight text-white md:text-3xl"
      >
        {d.ctaHeading}
      </h2>
      <p className="mt-3 max-w-xl font-body text-[15px] leading-relaxed text-white/60">
        {d.ctaText}
      </p>
      <a
        href={whatsappUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("stock_contact_click", { slug: item.slug, source: "detalhe" })}
        className="mt-8 inline-flex items-center rounded-xl bg-teal px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_4px_20px_rgba(44,141,255,0.35)] outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors duration-300 hover:bg-teal-deep focus-visible:ring-2"
      >
        {d.cta}
      </a>
    </section>
  );
}
