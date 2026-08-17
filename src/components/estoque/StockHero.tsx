import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StockPhoto } from "./StockPhoto";
import { whatsappUrl } from "@/lib/site";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";
import type { StockImage } from "@/lib/stock/types";

/**
 * Abertura do estoque. Server component: o H1 e o texto saem no HTML inicial,
 * e a única foto acima da dobra carrega com prioridade.
 */
export function StockHero({
  photo,
  totals,
  locale,
  dict,
}: {
  photo: StockImage | null;
  totals: { items: number; photos: number; categories: number };
  locale: Locale;
  dict: Dictionary;
}) {
  const d = dict.stock;

  return (
    <section className="relative overflow-hidden bg-ink pt-8 md:pt-10">
      <Container>
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <SectionLabel label={d.label} />

            <h1 className="mt-6 max-w-3xl font-display text-[8vw] font-light leading-[1.04] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.4rem]">
              {d.headingBefore}{" "}
              <span className="font-medium">{d.headingHighlight}</span>.
            </h1>

            <p className="mt-7 max-w-xl font-body text-[15px] leading-relaxed text-white/65 md:text-base">
              {d.intro1} <span className="text-white">{d.introTons}</span>{" "}
              {d.intro2}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={whatsappUrl(d.heroCtaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl bg-teal px-7 py-3.5 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_4px_20px_rgba(44,141,255,0.35)] outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors duration-300 hover:bg-teal-deep focus-visible:ring-2"
              >
                {d.heroCta}
              </a>
              <Link
                href={`${localePath(locale)}#categorias`}
                className="font-body text-[14px] text-white/60 underline-offset-4 transition-colors hover:text-teal hover:underline"
              >
                {d.heroSecondary}
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <Stat value={totals.items} label={d.stats.items} />
              <Stat value={totals.photos} label={d.stats.photos} />
              <Stat value={totals.categories} label={d.stats.categories} />
            </dl>
          </div>

          {photo && (
            <div className="lg:col-span-5">
              <div className="relative aspect-4/3 overflow-hidden rounded-lg border border-white/10 bg-navy-soft lg:aspect-3/4">
                <StockPhoto
                  image={photo}
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="sr-only">{label}</dt>
      <dd className="flex flex-col gap-2">
        <span className="h-[3px] w-6 bg-teal" />
        <span className="font-display text-3xl font-medium leading-none tracking-tight text-white md:text-4xl">
          {value}
        </span>
        <span className="font-body text-[11px] uppercase leading-snug tracking-[0.08em] text-white/45">
          {label}
        </span>
      </dd>
    </div>
  );
}
