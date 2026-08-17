"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { useI18n } from "@/lib/i18n/context";

const FAQ_KEYS = ["types", "lots", "coverage", "appraisal", "broker"] as const;

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { dict } = useI18n();
  const faqs = FAQ_KEYS.map((key) => dict.faq.items[key]);

  return (
    <section id="faq" className="relative bg-ink py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionLabel index="07" label={dict.faq.label} />
            <Reveal className="mt-8 md:mt-10">
              <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
                {dict.faq.heading}
              </h2>
            </Reveal>
          </div>

          <RevealGroup className="lg:col-span-8">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <RevealItem key={item.q}>
                  <div className="border-t border-white/15 last:border-b">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
                    >
                      <span className="font-display text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
                        {item.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-300 ${
                          isOpen ? "bg-teal ring-teal" : "ring-white/20"
                        }`}
                      >
                        <Plus
                          size={16}
                          strokeWidth={1.5}
                          className={isOpen ? "text-white" : "text-white/70"}
                        />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-xl pb-7 font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </Container>

      <SectionDivider fillClassName="fill-alabaster" />
    </section>
  );
}
