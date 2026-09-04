"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Highlight } from "@/components/ui/Highlight";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/site";

export function Hero() {
  const { dict } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.22]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink text-white"
    >
      <div className="absolute inset-0">
        <motion.div className="absolute inset-0" style={{ scale: backgroundScale }}>
          <Image
            src="/images/hero-industrial-hall.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            aria-hidden="true"
            className="object-cover object-[center_34%]"
          />
        </motion.div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-navy/20"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-ink/25" />
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
              {dict.hero.eyebrow}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="mt-6 max-w-3xl font-display text-[9vw] font-light leading-[1.02] tracking-tight sm:text-5xl md:text-5xl lg:text-[3.6rem]"
            >
              {dict.hero.titleBefore}{" "}
              <Highlight delay={0.9}>
                <span className="font-medium">{dict.hero.titleHighlight1}</span>
              </Highlight>
              {dict.hero.titleMiddle}
              <Highlight delay={1.1}>
                <span className="font-medium">{dict.hero.titleHighlight2}</span>
              </Highlight>
              {dict.hero.titleAfter}
            </motion.h1>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-4 lg:items-start lg:pb-2">
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="max-w-sm font-body text-sm leading-relaxed text-white/70 md:text-base"
            >
              {dict.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            >
              <a
                href={whatsappUrl(dict.header.ctaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl bg-teal px-7 py-3.5 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-teal-deep"
              >
                {dict.hero.cta}
              </a>
            </motion.div>
          </div>
        </div>
      </Container>

      <SectionDivider fillClassName="fill-alabaster" />
    </section>
  );
}
