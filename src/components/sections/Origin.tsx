"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n/context";

/**
 * Origem da empresa — as três gerações que dão nome à 3WS.
 *
 * Entra logo depois de "Sobre", que já afirma "há três gerações": esta seção é
 * a prova dessa frase, com as três pessoas na mesma foto. O divisor da seção
 * anterior já preenche em `ink`, então a transição continua natural e Serviços
 * segue na sequência sem quebra.
 *
 * O texto não afirma datas, cidade nem ano de fundação — nada disso está
 * documentado no material do site.
 */
export function Origin() {
  const { dict } = useI18n();
  const d = dict.origin;

  return (
    <section id="origem" className="relative bg-ink py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <figure className="relative overflow-hidden rounded-lg border border-white/10 bg-navy-soft">
              {/* As três larguras já são geradas no build a partir do original,
                  então next/image só acrescentaria uma transformação em runtime. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/origem-3ws-1000.webp"
                srcSet="/images/origem-3ws-640.webp 640w, /images/origem-3ws-1000.webp 1000w, /images/origem-3ws-1600.webp 1600w"
                sizes="(min-width: 1024px) 45vw, 92vw"
                width={1600}
                height={2240}
                loading="lazy"
                decoding="async"
                alt={d.photoAlt}
                className="h-full w-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent px-6 pb-5 pt-16 font-body text-[13px] leading-relaxed text-white/75">
                {d.caption}
              </figcaption>
            </figure>
          </Reveal>

          <div className="lg:col-span-6">
            <SectionLabel label={d.label} />

            <Reveal className="mt-6">
              <h2 className="max-w-xl font-display text-3xl font-medium leading-[1.12] tracking-tight text-white sm:text-4xl md:text-[2.6rem]">
                {d.heading}
              </h2>
            </Reveal>

            <Reveal delay={0.08} className="mt-7 flex max-w-xl flex-col gap-5">
              <p className="font-body text-[15px] leading-relaxed text-white/65 md:text-base">
                {d.paragraph1}
              </p>
              <p className="font-body text-[15px] leading-relaxed text-white/65 md:text-base">
                {d.paragraph2}
              </p>
              <p className="font-body text-[15px] leading-relaxed text-white/65 md:text-base">
                {d.paragraph3}
              </p>
            </Reveal>

            <Reveal delay={0.16} className="mt-10">
              <ol className="flex flex-col gap-0 border-t border-white/10">
                {[d.gen1, d.gen2, d.gen3].map((generation, index) => (
                  <li
                    key={generation}
                    className="flex items-baseline gap-5 border-b border-white/10 py-4"
                  >
                    <span className="font-display text-sm font-medium tabular-nums text-teal">
                      0{index + 1}
                    </span>
                    <span className="font-body text-[15px] leading-relaxed text-white/75">
                      {generation}
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
