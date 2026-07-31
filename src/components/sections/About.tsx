"use client";

import { Container } from "@/components/ui/Container";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { CountUp } from "@/components/ui/CountUp";

const INDICATORS = [
  { target: 1500, suffix: "+", label: "toneladas em ferramentas industriais" },
  { target: 3, label: "gerações de experiência" },
  { target: 100, suffix: "%", label: "atendimento em todo o Brasil" },
  { value: "+XX", label: "toneladas negociadas e entregues" },
];

export function About() {
  return (
    <section id="sobre" className="relative bg-alabaster pb-16 pt-8 md:pb-20 md:pt-10">
      <Container>
        <Reveal>
          <span className="inline-flex items-center rounded-full bg-teal/12 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.16em] text-teal-deep">
            Sobre
          </span>
        </Reveal>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal delay={0.05} className="lg:col-span-8">
            <h2 className="font-display text-lg font-medium leading-snug tracking-tight text-ink/80 sm:text-xl md:text-2xl">
              Há três gerações, a 3WS molda confiança, valoriza ativos e cria
              oportunidades reais de negócio.
            </h2>
          </Reveal>

          <RevealGroup className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-3 lg:col-span-9 lg:col-start-4">
            <RevealItem>
              <p className="max-w-xs font-body text-[15px] font-medium leading-relaxed text-ink/60 md:text-base">
                Conectamos empresas que desejam vender ou adquirir moldes,
                porta-moldes e equipamentos industriais.
              </p>
            </RevealItem>
            <RevealItem>
              <p className="max-w-xs font-body text-[15px] font-medium leading-relaxed text-ink/60 md:text-base">
                Nossa missão é transformar ativos parados em novas
                possibilidades, unindo experiência, segurança técnica e
                negociações confiáveis.
              </p>
            </RevealItem>
          </RevealGroup>
        </div>

        <RevealGroup className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:mt-12 md:grid-cols-4 md:gap-x-8">
          {INDICATORS.map((item) => (
            <RevealItem key={item.label} className="flex flex-col gap-3">
              <span className="h-[3px] w-6 bg-teal-deep" />
              <span className="font-display text-4xl font-black leading-none tracking-tight text-ink md:text-5xl">
                {item.target !== undefined ? (
                  <CountUp target={item.target} suffix={item.suffix ?? ""} />
                ) : (
                  item.value
                )}
              </span>
              <span className="font-body text-xs uppercase leading-snug tracking-[0.08em] text-ink/55 md:text-[13px]">
                {item.label}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>

      <SectionDivider fillClassName="fill-ink" />
    </section>
  );
}
