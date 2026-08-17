"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { useI18n } from "@/lib/i18n/context";

export function WhatWeBuy() {
  const { dict } = useI18n();

  return (
    <section className="relative bg-alabaster py-24 text-ink md:py-32">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <SectionLabel index="02" label={dict.whatWeBuy.label} tone="onLight" />

            <Reveal className="mt-8 md:mt-10">
              <h2 className="font-display text-3xl font-medium leading-[1.15] tracking-tight sm:text-4xl md:text-[2.75rem]">
                {dict.whatWeBuy.heading}
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="lg:col-span-6">
            <PhotoImage
              src="/images/gallery/11-ativos-industriais-avaliados.webp"
              alt={dict.whatWeBuy.imageAlt}
              className="aspect-[5/4] w-full"
            />
          </Reveal>
        </div>
      </Container>

      <SectionDivider fillClassName="fill-ink" />
    </section>
  );
}
