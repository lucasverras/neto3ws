"use client";

import { useState, type MouseEvent } from "react";
import {
  Boxes,
  ClipboardCheck,
  History,
  LifeBuoy,
  Recycle,
  Scale,
  Truck,
  TrendingDown,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n/context";

const DIFFERENTIAL_KEYS = [
  { key: "scale", icon: Scale },
  { key: "experience", icon: History },
  { key: "appraisal", icon: ClipboardCheck },
  { key: "lots", icon: Boxes },
  { key: "coverage", icon: Truck },
  { key: "savings", icon: TrendingDown },
  { key: "reuse", icon: Recycle },
  { key: "support", icon: LifeBuoy },
] as const;

type DifferentialItem = { icon: typeof Scale; title: string; description: string };

function DifferentialCard({ item }: { item: DifferentialItem }) {
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });
  const Icon = item.icon;

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 1,
    });
  };

  return (
    <RevealItem className="relative overflow-hidden">
      <div
        className="relative flex h-full flex-col gap-4 px-6 py-10 sm:py-12"
        onMouseMove={handleMove}
        onMouseLeave={() => setGlow((g) => ({ ...g, opacity: 0 }))}
      >
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: glow.opacity,
            background: `radial-gradient(220px circle at ${glow.x}% ${glow.y}%, rgba(44,141,255,0.16), transparent 70%)`,
          }}
        />
        <Icon size={20} strokeWidth={1.5} className="relative text-teal" />
        <div className="relative flex flex-col gap-2">
          <span className="font-display text-base font-medium leading-snug tracking-tight text-white sm:text-lg">
            {item.title}
          </span>
          <p className="font-body text-sm leading-relaxed text-white/50">
            {item.description}
          </p>
        </div>
      </div>
    </RevealItem>
  );
}

export function Differentials() {
  const { dict } = useI18n();
  const items: DifferentialItem[] = DIFFERENTIAL_KEYS.map(({ key, icon }) => ({
    icon,
    ...dict.differentials.items[key],
  }));
  const rows = [items.slice(0, 4), items.slice(4, 8)];

  return (
    <section className="relative bg-ink py-24 md:py-32">
      <Container>
        <SectionLabel index="05" label={dict.differentials.label} />
        <Reveal className="mt-8 max-w-2xl md:mt-10">
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
            {dict.differentials.heading}
          </h2>
        </Reveal>

        <div className="mt-16 border-t border-white/10 md:mt-20">
          {rows.map((row, rowIndex) => (
            <RevealGroup
              key={rowIndex}
              stagger={0.1}
              className="grid grid-cols-2 divide-x divide-white/10 border-x border-b border-white/10 sm:grid-cols-4"
            >
              {row.map((item) => (
                <DifferentialCard key={item.title} item={item} />
              ))}
            </RevealGroup>
          ))}
        </div>
      </Container>
    </section>
  );
}
