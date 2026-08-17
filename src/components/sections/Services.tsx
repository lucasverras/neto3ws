"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Boxes, ClipboardCheck, Handshake, Scale, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { useI18n } from "@/lib/i18n/context";

const SERVICE_KEYS = [
  { key: "buy", icon: Wrench, image: "/images/gallery/01-compra-moldes-e-equipamentos.webp" },
  { key: "sell", icon: Boxes, image: "/images/gallery/02-venda-moldes-e-equipamentos.webp" },
  { key: "broker", icon: Handshake, image: "/images/gallery/03-intermediacao-comercial.webp" },
  { key: "weight", icon: Scale, image: "/images/gallery/04-compra-ferramentas-por-peso.webp" },
  {
    key: "consulting",
    icon: ClipboardCheck,
    image: "/images/gallery/05-avaliacao-consultoria-tecnica.webp",
  },
] as const;

interface Service {
  icon: typeof Wrench;
  image: string;
  title: string;
  description: string;
  features: string[];
}

const COUNT = SERVICE_KEYS.length;

function ServiceRow({
  service,
  isActive,
  highlightsLabel,
  onActivate,
}: {
  service: Service;
  isActive: boolean;
  highlightsLabel: string;
  onActivate: () => void;
}) {
  const Icon = service.icon;
  return (
    <div className="border-b border-white/12">
      {/* Botão de verdade: além do mouse, dá para chegar de Tab e abrir com
          o teclado, o que não existia quando só o scroll comandava. */}
      <button
        type="button"
        aria-current={isActive}
        onMouseEnter={onActivate}
        onFocus={onActivate}
        onClick={onActivate}
        className="flex w-full cursor-default items-center gap-6 py-3 text-left outline-none ring-teal focus-visible:ring-2 md:gap-8"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-300 ${
            isActive ? "bg-white text-ink ring-white" : "text-white/45 ring-white/20"
          }`}
        >
          <Icon size={16} strokeWidth={1.5} />
        </span>

        <motion.div
          className="w-64 shrink-0 overflow-hidden lg:w-72 xl:w-96"
          animate={{ height: isActive ? 210 : 40 }}
          initial={false}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <PhotoImage src={service.image} alt={service.title} className="h-full w-full" />
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
          className="hidden shrink-0 flex-col gap-2 overflow-hidden xl:flex xl:w-56"
        >
          <span className="font-body text-[11px] uppercase tracking-[0.16em] text-white/30">
            {highlightsLabel}
          </span>
          {service.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 font-body text-sm text-white/60">
              <span className="mt-2 h-px w-3 shrink-0 bg-teal" />
              {feature}
            </li>
          ))}
        </motion.ul>
      </button>
    </div>
  );
}

export function Services() {
  const { dict } = useI18n();
  // Duas fontes independentes para o item ativo, compostas na renderização.
  // Quem agiu por último vence: apontar o mouse fixa o item; voltar a rolar
  // devolve o comando ao scroll. Sem isso, os dois disputariam o mesmo estado
  // e a lista piscaria a cada evento.
  const [pointerActive, setPointerActive] = useState<number | null>(null);
  const services: Service[] = SERVICE_KEYS.map(({ key, icon, image }) => {
    const copy = dict.services.items[key];
    return {
      icon,
      image,
      title: copy.title,
      description: copy.description,
      features: [copy.feature1, copy.feature2],
    };
  });
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
      // Rolar retoma o controle de quem estava com o mouse parado sobre a lista.
      setPointerActive(null);
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
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-28 pb-10">
          <Container>
            <SectionLabel index="01" label={dict.services.label} />
            <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl">
              {dict.services.heading}
            </h2>

            <div
              className="mt-10 border-t border-white/12"
              onMouseLeave={() => setPointerActive(null)}
            >
              {services.map((service, i) => (
                <ServiceRow
                  key={service.title}
                  service={service}
                  isActive={active === i}
                  highlightsLabel={dict.services.highlights}
                  onActivate={() => setPointerActive(i)}
                />
              ))}
            </div>
          </Container>
        </div>
      </div>

      {/* Mobile: simple static list */}
      <Container className="py-24 lg:hidden">
        <SectionLabel index="01" label={dict.services.label} />
        <h2 className="mt-8 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
          {dict.services.heading}
        </h2>

        <div className="mt-14 flex flex-col gap-10">
          {services.map((service) => (
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
