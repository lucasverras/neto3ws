"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n/context";

export function Sustainability() {
  const { dict } = useI18n();

  return (
    <section className="eco-paper relative py-24 md:py-32">
      <Container>
        <div className="flex flex-col items-start gap-10 lg:items-center lg:text-center">
          <SectionLabel index="06" label={dict.sustainability.label} tone="onLight" />

          <Reveal className="max-w-4xl">
            <p className="font-display text-3xl font-medium leading-[1.2] tracking-tight text-ink/85 sm:text-4xl md:text-5xl">
              {dict.sustainability.text}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <span className="inline-block h-px w-16 bg-teal-deep" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
