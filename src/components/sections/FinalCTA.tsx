"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionDivider } from "@/components/ui/SectionDivider";

export function FinalCTA() {
  return (
    <section id="contato" className="relative bg-alabaster py-28 text-ink md:py-40">
      <Container>
        <div className="flex flex-col items-start gap-10 lg:items-center lg:text-center">
          <Reveal className="max-w-3xl">
            <h2 className="font-display text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Tem um molde parado ou procura uma oportunidade industrial?
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="max-w-xl">
            <p className="font-body text-base leading-relaxed text-ink/65 md:text-lg">
              Entre em contato com nossa equipe e descubra como podemos
              ajudar.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <motion.a
              href="https://wa.me/5511973692861"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center rounded-xl bg-teal px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_4px_20px_rgba(44,141,255,0.35)] transition-colors duration-300 hover:bg-teal-deep"
            >
              Falar com um Especialista
            </motion.a>
          </Reveal>
        </div>
      </Container>

      <SectionDivider fillClassName="fill-ink" />
    </section>
  );
}
