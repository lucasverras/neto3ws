"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { useI18n } from "@/lib/i18n/context";

const CATEGORY_KEYS = [
  { key: "injection", image: "/images/gallery/06-moldes-injecao-plastica.webp" },
  { key: "moldBases", image: "/images/gallery/07-porta-moldes.webp" },
  { key: "stampBases", image: "/images/gallery/08-bases-para-estampos.webp" },
  { key: "equipment", image: "/images/gallery/09-equipamentos-industriais.webp" },
  { key: "specialTools", image: "/images/gallery/10-ferramentas-especiais.webp" },
] as const;

const COUNT = CATEGORY_KEYS.length;

export function Categories() {
  const { dict } = useI18n();
  // Mouse e scroll são fontes separadas, compostas na renderização. Enquanto o
  // ponteiro está sobre a lista ele detém o controle e a rolagem não troca o
  // item — senão os dois avançariam juntos e a lista passaria direto. O scroll
  // volta a comandar quando o ponteiro sai.
  const [pointerActive, setPointerActive] = useState<number | null>(null);
  const categories = CATEGORY_KEYS.map(({ key, image }) => ({
    image,
    ...dict.categories.items[key],
  }));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scrollActive, setScrollActive] = useState(0);
  const active = pointerActive ?? scrollActive;

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) : 0;
      setScrollActive(Math.min(COUNT - 1, Math.floor(p * COUNT)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="categorias" className="relative bg-ink">
      {/* Desktop: pinned scroll-locked list */}
      <div ref={wrapperRef} className="hidden lg:block" style={{ height: `${COUNT * 48}vh` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-28 pb-36">
          <Container>
            <SectionLabel index="03" label={dict.categories.label} className="justify-center" />
            <h2 className="mx-auto mt-6 max-w-3xl text-center font-display text-4xl font-bold leading-[1.05] tracking-tight text-white">
              {dict.categories.heading}
            </h2>

            <div className="mt-12 grid grid-cols-12 items-stretch gap-16">
              <div
                className="col-span-7 flex flex-col justify-center"
                onMouseLeave={() => setPointerActive(null)}
              >
                {categories.map((category, i) => {
                  const isActive = active === i;
                  return (
                    <button
                      key={category.title}
                      type="button"
                      aria-current={isActive}
                      // `onMouseMove` em vez de `onMouseEnter`: rolar a página faz
                      // outra linha deslizar sob o cursor parado e disparar
                      // `mouseenter`, o que fazia a seleção acompanhar a rolagem
                      // mesmo com o mouse imóvel. `mousemove` só dispara quando o
                      // ponteiro realmente se move.
                      onMouseMove={() => setPointerActive(i)}
                      onFocus={() => setPointerActive(i)}
                      onClick={() => setPointerActive(i)}
                      className="flex cursor-default flex-col justify-center gap-2 border-b border-white/12 py-4 text-left outline-none ring-teal focus-visible:ring-2"
                    >
                      <h3
                        className={`font-display text-2xl font-medium leading-[1.1] tracking-tight transition-colors duration-500 sm:text-3xl ${
                          isActive ? "text-white" : "text-white/25"
                        }`}
                      >
                        {category.title}
                      </h3>
                      <motion.p
                        initial={false}
                        animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-md overflow-hidden font-body text-[15px] leading-relaxed text-white/60"
                      >
                        {category.description}
                      </motion.p>
                    </button>
                  );
                })}
              </div>

              <div className="col-span-5">
                <div className="relative h-full w-full overflow-hidden rounded-lg">
                  {categories.map((category, i) => (
                    <motion.div
                      key={category.title}
                      className="absolute inset-0"
                      animate={{ opacity: active === i ? 1 : 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <PhotoImage src={category.image} alt={category.title} className="h-full w-full" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Mobile: simple static list */}
      <Container className="py-24 lg:hidden">
        <SectionLabel index="03" label={dict.categories.label} className="justify-center" />
        <Reveal className="mx-auto mt-8 max-w-3xl text-center">
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
            {dict.categories.heading}
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-col gap-10">
          {categories.map((category, i) => (
            <Reveal key={category.title} delay={i * 0.05}>
              <div className="flex flex-col gap-3 border-t border-white/12 pt-6">
                <h3 className="font-display text-2xl font-medium leading-[1.1] tracking-tight text-white">
                  {category.title}
                </h3>
                <p className="max-w-md font-body text-[15px] leading-relaxed text-white/60">
                  {category.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <SectionDivider fillClassName="fill-alabaster" />
    </section>
  );
}
