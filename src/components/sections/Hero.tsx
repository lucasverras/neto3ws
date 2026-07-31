"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Highlight } from "@/components/ui/Highlight";
import { scrollToId } from "@/lib/scrollTo";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
          className="h-full w-full object-cover"
        >
          <source src="/video/hero-metal.webm" type="video/webm" />
          <source src="/video/hero-metal.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-navy/20" />
        <div className="absolute inset-0 bg-ink/25" />
      </div>

      <Container className="relative z-10 pb-24 pt-32 md:pb-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-8">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-xs uppercase tracking-[0.32em] text-white/60"
            >
              Ativos Industriais de Alto Valor
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="mt-6 max-w-3xl font-display text-[9vw] font-light leading-[1.02] tracking-tight sm:text-5xl md:text-5xl lg:text-[3.6rem]"
            >
              Mais de{" "}
              <Highlight delay={0.9}>
                <span className="font-medium">1.500 toneladas</span>
              </Highlight>{" "}
              em{" "}
              <Highlight delay={1.1}>
                <span className="font-medium">moldes e oportunidades</span>
              </Highlight>{" "}
              industriais.
            </motion.h1>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-4 lg:items-start lg:pb-2">
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="max-w-sm font-body text-sm leading-relaxed text-white/70 md:text-base"
            >
              Compra, venda e intermediação de moldes para injeção plástica,
              porta-moldes, bases para estampos e equipamentos industriais. A
              3WS conecta ativos disponíveis a empresas que buscam reduzir
              custos e acelerar projetos em todo o Brasil.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            >
              <a
                href="#contato"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("contato");
                }}
                className="inline-flex items-center rounded-xl bg-teal px-7 py-3.5 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-teal-deep"
              >
                Solicitar Avaliação
              </a>
            </motion.div>
          </div>
        </div>
      </Container>

      <SectionDivider fillClassName="fill-alabaster" />
    </section>
  );
}
