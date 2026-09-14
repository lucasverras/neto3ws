"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { localePath } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * Bento de cards com fotografia real da operação. Cada card leva a uma página
 * comercial de verdade (hub de links internos). O card "por kg" recebe destaque
 * visual por ser o maior diferencial. Hover em transform/CSS (barato, na GPU) e
 * entrada com Reveal — sem scroll-jacking nem canvas, para não penalizar o LCP.
 */
const BENTO = [
  {
    key: "buy",
    image: "/images/gallery/01-compra-moldes-e-equipamentos.webp",
    href: "/compramos-moldes",
    span: "lg:col-span-2 lg:row-span-2",
    minH: "min-h-[19rem] lg:min-h-0",
    sizes: "(min-width: 1024px) 50vw, 100vw",
  },
  {
    key: "weight",
    image: "/images/gallery/04-compra-ferramentas-por-peso.webp",
    href: "/moldes-por-quilo",
    span: "lg:col-span-2",
    minH: "min-h-[15rem] lg:min-h-0",
    sizes: "(min-width: 1024px) 50vw, 100vw",
    feature: true,
  },
  {
    key: "sell",
    image: "/images/gallery/02-venda-moldes-e-equipamentos.webp",
    href: "/venda-seu-molde",
    span: "lg:col-span-1",
    minH: "min-h-[15rem] lg:min-h-0",
    sizes: "(min-width: 1024px) 25vw, 100vw",
  },
  {
    key: "moldBases",
    image: "/images/gallery/07-porta-moldes.webp",
    href: "/porta-moldes-usados",
    span: "lg:col-span-1",
    minH: "min-h-[15rem] lg:min-h-0",
    sizes: "(min-width: 1024px) 25vw, 100vw",
  },
  {
    key: "appraisal",
    image: "/images/gallery/05-avaliacao-consultoria-tecnica.webp",
    href: "/servicos",
    span: "lg:col-span-2",
    minH: "min-h-[15rem] lg:min-h-0",
    sizes: "(min-width: 1024px) 50vw, 100vw",
  },
  {
    key: "reuse",
    image: "/images/gallery/10-ferramentas-especiais.webp",
    href: "/servicos",
    span: "lg:col-span-2",
    minH: "min-h-[15rem] lg:min-h-0",
    sizes: "(min-width: 1024px) 50vw, 100vw",
  },
] as const;

export function Services() {
  const { locale, dict } = useI18n();
  const b = dict.servicesBento;

  return (
    <section id="servicos" className="relative bg-ink">
      <Container className="py-24 md:py-32">
        <Reveal>
          <SectionLabel label={b.label} />
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl">
            {b.heading}
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[13rem]">
          {BENTO.map((card) => {
            const copy = b.items[card.key];
            const feature = "feature" in card && card.feature;
            return (
              <RevealItem key={card.key} className={cn(card.span, card.minH)}>
                <Link
                  href={localePath(locale, card.href)}
                  className={cn(
                    "group relative flex h-full flex-col justify-end overflow-hidden rounded-lg border outline-none ring-teal transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                    feature
                      ? "border-teal/40 shadow-[0_8px_40px_rgba(44,141,255,0.18)]"
                      : "border-white/10 hover:border-white/25"
                  )}
                >
                  <Image
                    src={card.image}
                    alt={copy.alt}
                    fill
                    sizes={card.sizes}
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden
                    className={cn(
                      "absolute inset-0",
                      feature
                        ? "bg-gradient-to-t from-navy/95 via-navy/45 to-navy/10"
                        : "bg-gradient-to-t from-ink/92 via-ink/40 to-ink/5"
                    )}
                  />

                  {feature && (
                    <span className="absolute left-5 top-5 z-10 inline-flex items-center rounded-full bg-teal px-3 py-1.5 font-body text-[11px] font-medium uppercase tracking-[0.14em] text-white shadow-[0_4px_16px_rgba(44,141,255,0.4)]">
                      {b.weightTag}
                    </span>
                  )}

                  <div className="relative z-10 flex flex-col gap-2 p-6 md:p-7">
                    <h3
                      className={cn(
                        "font-display font-semibold leading-tight tracking-tight text-white",
                        feature ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
                      )}
                    >
                      {copy.title}
                    </h3>
                    <p className="max-w-md font-body text-[13.5px] leading-relaxed text-white/70 md:text-sm">
                      {copy.text}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1.5 font-body text-[12px] font-medium uppercase tracking-[0.14em] text-teal transition-transform duration-300 group-hover:translate-x-0.5">
                      {b.cta}
                      <ArrowUpRight size={14} strokeWidth={2} />
                    </span>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>

      <SectionDivider fillClassName="fill-alabaster" />
    </section>
  );
}
