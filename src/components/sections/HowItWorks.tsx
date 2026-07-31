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

        <RevealGroup className="relative mt-20 grid grid-cols-1 gap-14 md:mt-24 md:grid-cols-4 md:gap-8">
          <div className="pointer-events-none absolute left-0 right-0 top-[1.6rem] hidden h-px bg-ink/15 md:block" />

          {STEPS.map((step, i) => (
            <RevealItem key={step} className="relative">
              <motion.div
                className="group flex cursor-default flex-col gap-6"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-4 md:block">
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-alabaster font-display text-xl font-bold text-teal-deep ring-1 ring-teal-deep/40 transition-colors duration-300 group-hover:bg-teal group-hover:text-white group-hover:ring-teal md:h-14 md:w-14 md:text-2xl">
                    {i + 1}
                  </span>
                </div>
                <p className="font-body text-[15px] leading-relaxed text-ink/65 md:pr-4 md:text-base">
                  {step}
                </p>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>

      <SectionDivider fillClassName="fill-ink" />
    </section>
  );
}
