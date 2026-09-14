"use client";

import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * Vitrine de amostras: peças plásticas reais injetadas a partir de moldes que
 * passaram pela 3WS. Prova visual do que os moldes do acervo produzem. Fotos em
 * fundo claro que ganham contraste na seção escura; hover em transform (GPU).
 */
const SHOTS = [
  { src: "/images/gallery/amostra-01.webp", alt: "alt1", span: "sm:col-span-2 lg:col-span-2 lg:row-span-2", minH: "min-h-[15rem] lg:min-h-0" },
  { src: "/images/gallery/amostra-02.webp", alt: "alt2", span: "lg:col-span-1", minH: "min-h-[12rem] lg:min-h-0" },
  { src: "/images/gallery/amostra-03.webp", alt: "alt3", span: "lg:col-span-1", minH: "min-h-[12rem] lg:min-h-0" },
  { src: "/images/gallery/amostra-04.webp", alt: "alt4", span: "lg:col-span-1", minH: "min-h-[12rem] lg:min-h-0" },
  { src: "/images/gallery/amostra-05.webp", alt: "alt5", span: "lg:col-span-1", minH: "min-h-[12rem] lg:min-h-0" },
] as const;

export function Amostras() {
  const { dict } = useI18n();
  const a = dict.amostras;

  return (
    <section id="amostras" className="relative bg-ink">
      <Container className="py-24 md:py-32">
        <Reveal>
          <SectionLabel label={a.label} />
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl">
            {a.heading}
          </h2>
          <p className="mt-5 max-w-xl font-body text-[15px] leading-relaxed text-white/55 md:text-base">
            {a.text}
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:auto-rows-[12.5rem]">
          {SHOTS.map((shot) => (
            <RevealItem key={shot.src} className={cn(shot.span, shot.minH)}>
              <div className="group relative h-full overflow-hidden rounded-lg border border-white/10 bg-navy-soft">
                <Image
                  src={shot.src}
                  alt={a[shot.alt]}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
