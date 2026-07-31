"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionDivider } from "@/components/ui/SectionDivider";

const STEPS = [
  "Você envia as informações, imagens e especificações do ativo.",
  "Nossa equipe realiza uma avaliação técnica e comercial.",
  "Apresentamos uma proposta de compra ou definimos a estratégia de intermediação.",
  "Acompanhamos a negociação, retirada e conclusão do processo.",
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative bg-alabaster py-24 md:py-32">
      <Container>
        <SectionLabel index="04" label="Como Funciona" tone="onLight" />

        <Reveal className="mt-8 max-w-2xl md:mt-10">
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Linha do tempo de uma negociação com a 3WS.
          </h2>
        </Reveal>

        {/* Mobile: zigzag timeline, everything on one screen, no scroll */}
        <RevealGroup className="mt-16 grid grid-cols-4 md:hidden">
          {STEPS.map((step, i) => (
            <p
              key={`top-${step}`}
              style={{ gridColumn: i + 1, gridRow: 1 }}
              className={`px-1 text-center font-body text-[11px] leading-snug text-ink/60 ${
                i % 2 === 0 ? "" : "invisible"
              }`}
            >
              {step}
            </p>
          ))}

          <div className="relative col-span-4 row-start-2 flex items-center py-3">
            <div className="pointer-events-none absolute inset-x-[12%] top-1/2 h-px -translate-y-1/2 bg-ink/15" />
            {STEPS.map((_, i) => (
              <RevealItem
                key={`dot-${i}`}
                className="relative z-10 flex flex-1 items-center justify-center"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-alabaster font-display text-sm font-bold text-teal-deep ring-1 ring-teal-deep/40">
                  {i + 1}
                </span>
              </RevealItem>
            ))}
          </div>

          {STEPS.map((step, i) => (
            <p
              key={`bottom-${step}`}
              style={{ gridColumn: i + 1, gridRow: 3 }}
              className={`px-1 text-center font-body text-[11px] leading-snug text-ink/60 ${
                i % 2 === 1 ? "" : "invisible"
              }`}
            >
              {step}
            </p>
          ))}
        </RevealGroup>

        {/* Desktop: even row of cards with a connecting line */}
        <RevealGroup className="relative mt-24 hidden md:grid md:grid-cols-4 md:gap-8">
          <div className="pointer-events-none absolute left-0 right-0 top-[1.6rem] h-px bg-ink/15" />

          {STEPS.map((step, i) => (
            <RevealItem key={step} className="relative">
              <motion.div
                className="group flex h-full cursor-default flex-col gap-6"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-alabaster font-display text-2xl font-bold text-teal-deep ring-1 ring-teal-deep/40 transition-colors duration-300 group-hover:bg-teal group-hover:text-white group-hover:ring-teal">
                  {i + 1}
                </span>
                <p className="pr-4 font-body text-base leading-relaxed text-ink/65">{step}</p>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>

      <SectionDivider fillClassName="fill-ink" />
    </section>
  );
}
