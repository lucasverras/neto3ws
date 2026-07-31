"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Boxes, ClipboardCheck, Handshake, Scale, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { SectionDivider } from "@/components/ui/SectionDivider";

const SERVICES = [
  {
    icon: Wrench,
    title: "Compra de moldes e equipamentos",
    description:
      "Adquirimos moldes, equipamentos e ferramentas industriais parados, dando novo destino a ativos de valor.",
    features: [
      "Moldes novos, usados ou desativados",
      "Equipamentos e ferramentas industriais",
    ],
  },
  {
    icon: Boxes,
    title: "Venda de moldes e equipamentos",
    description:
      "Disponibilizamos moldes e equipamentos avaliados tecnicamente para empresas que buscam reduzir custos e prazos.",
    features: [
      "Ativos avaliados tecnicamente",
      "Redução de custos e prazos",
    ],
  },
  {
    icon: Handshake,
    title: "Intermediação comercial",
    description:
      "Conectamos vendedores e compradores, conduzindo negociações seguras do início ao fim do processo.",
    features: [
      "Negociação conduzida do início ao fim",
      "Segurança para as duas partes",
    ],
  },
  {
    icon: Scale,
    title: "Compra de ferramentas por peso",
    description:
      "Avaliamos e adquirimos ferramentas industriais por peso, mesmo aquelas fora de operação.",
    features: [
      "Avaliação por peso especializada",
      "Ferramentas dentro ou fora de operação",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Avaliação e consultoria técnica",
    description:
      "Realizamos avaliação técnica especializada para orientar decisões de compra, venda ou reaproveitamento.",
    features: [
      "Avaliação técnica e comercial",
      "Suporte à decisão de reaproveitamento",
    ],
  },
];

const COUNT = SERVICES.length;

function ServiceRow({
  service,
  isActive,
  onActivate,
}: {
  service: (typeof SERVICES)[number];
  isActive: boolean;
  onActivate: () => void;
}) {
  const Icon = service.icon;
  return (
    <div className="border-b border-white/12" onMouseEnter={onActivate}>
      <div className="flex w-full items-center gap-6 py-3 text-left md:gap-8">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-300 ${
            isActive ? "bg-white text-ink ring-white" : "text-white/45 ring-white/20"
          }`}
        >
          <Icon size={16} strokeWidth={1.5} />
        </span>

        <motion.div
          className="w-64 shrink-0 overflow-hidden md:w-96"
          animate={{ height: isActive ? 210 : 40 }}
          initial={false}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <PlaceholderImage
            label={service.title}
            showLabel={isActive}
            className="h-full w-full"
          />
        </motion.div>

        <div className="flex flex-1 flex-col gap-1.5">
          <h3
            className={`font-display text-base font-semibold leading-tight tracking-tight transition-colors duration-300 sm:text-lg ${
              isActive ? "text-white" : "text-white/45"
            }`}
          >
            {service.title}
          </h3>
          <motion.p
            initial={false}
            animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden font-body text-sm leading-relaxed text-white/55 md:max-w-md"
          >
            {service.description}
          </motion.p>
        </div>

        <motion.ul
          initial={false}
          animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="hidden shrink-0 flex-col gap-2 overflow-hidden md:flex md:w-64"
        >
          <span className="font-body text-[10px] uppercase tracking-[0.16em] text-white/30">
            Destaques
          </span>
          {service.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 font-body text-sm text-white/60">
              <span className="mt-2 h-px w-3 shrink-0 bg-teal" />
              {feature}
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}

export function Services() {
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
    <section id="servicos" className="relative bg-ink">
      {/* Desktop: pinned scroll-locked list */}
      <div ref={wrapperRef} className="hidden lg:block" style={{ height: `${COUNT * 55}vh` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <Container>
            <SectionLabel index="01" label="Serviços" />
            <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl">
              Cinco formas de transformar ativos parados em oportunidade.
            </h2>

            <div className="mt-10 border-t border-white/12">
              {SERVICES.map((service, i) => (
                <ServiceRow
                  key={service.title}
                  service={service}
                  isActive={active === i}
                  onActivate={() => setActive(i)}
                />
              ))}
            </div>
          </Container>
        </div>
      </div>

      {/* Mobile: simple static list */}
      <Container className="py-24 lg:hidden">
        <SectionLabel index="01" label="Serviços" />
        <h2 className="mt-8 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
          Cinco formas de transformar ativos parados em oportunidade.
        </h2>

        <div className="mt-14 flex flex-col gap-10">
          {SERVICES.map((service) => (
            <div key={service.title} className="flex gap-4 border-t border-white/12 pt-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
                <service.icon size={18} strokeWidth={1.5} />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-lg font-bold text-white">{service.title}</h3>
                <p className="font-body text-sm leading-relaxed text-white/60">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      <SectionDivider fillClassName="fill-alabaster" />
    </section>
  );
}
