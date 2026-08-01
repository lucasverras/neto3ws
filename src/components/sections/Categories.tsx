"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionDivider } from "@/components/ui/SectionDivider";

const CATEGORIES = [
  {
    title: "Moldes para injeção plástica",
    description:
      "Moldes utilizados na fabricação de peças plásticas por injeção, avaliados quanto ao estado de conservação e à viabilidade de reaproveitamento.",
    image: "/images/gallery/06-moldes-injecao-plastica.png",
  },
  {
    title: "Porta-moldes",
    description:
      "Estruturas responsáveis por fixar e posicionar moldes durante o processo produtivo, negociadas separadamente ou como parte de um lote.",
    image: "/images/gallery/07-porta-moldes.png",
  },
  {
    title: "Bases para estampos",
    description:
      "Bases utilizadas em processos de estampagem, essenciais para a precisão e a estabilidade das ferramentas industriais.",
    image: "/images/gallery/08-bases-para-estampos.png",
  },
  {
    title: "Equipamentos industriais",
    description:
      "Máquinas e equipamentos de linha de produção, avaliados tecnicamente para compra, venda ou intermediação em todo o Brasil.",
    image: "/images/gallery/09-equipamentos-industriais.png",
  },
  {
    title: "Ferramentas especiais",
    description:
      "Ferramentas desenvolvidas para aplicações específicas, com potencial de reaproveitamento em novos projetos industriais.",
    image: "/images/gallery/10-ferramentas-especiais.png",
  },
];

const COUNT = CATEGORIES.length;

export function Categories() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) : 0;
      setActive(Math.min(COUNT - 1, Math.floor(p * COUNT)));
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
            <SectionLabel index="03" label="Categorias" className="justify-center" />
            <h2 className="mx-auto mt-6 max-w-3xl text-center font-display text-4xl font-bold leading-[1.05] tracking-tight text-white">
              Categorias dos ativos que a 3WS compra, vende ou intermedeia.
            </h2>

            <div className="mt-12 grid grid-cols-12 items-stretch gap-16">
              <div className="col-span-7 flex flex-col justify-center">
                {CATEGORIES.map((category, i) => {
                  const isActive = active === i;
                  return (
                    <div
                      key={category.title}
                      className="flex flex-col justify-center gap-2 border-b border-white/12 py-4"
                    >
                      <span
                        className={`font-body text-xs uppercase tracking-[0.24em] transition-colors duration-500 ${
                          isActive ? "text-teal" : "text-white/20"
                        }`}
                      >
                        Categoria 0{i + 1}
                      </span>
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
                    </div>
                  );
                })}
              </div>

              <div className="col-span-5">
                <div className="relative h-full w-full overflow-hidden rounded-lg">
                  {CATEGORIES.map((category, i) => (
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
        <SectionLabel index="03" label="Categorias" className="justify-center" />
        <Reveal className="mx-auto mt-8 max-w-3xl text-center">
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
            Categorias dos ativos que a 3WS compra, vende ou intermedeia.
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-col gap-10">
          {CATEGORIES.map((category, i) => (
            <Reveal key={category.title} delay={i * 0.05}>
              <div className="flex flex-col gap-3 border-t border-white/12 pt-6">
                <span className="font-body text-xs uppercase tracking-[0.24em] text-teal">
                  Categoria 0{i + 1}
                </span>
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
