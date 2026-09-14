import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Breadcrumbs } from "@/components/estoque/Breadcrumbs";
import { SITE, absoluteUrl, whatsappUrl } from "@/lib/site";
import { LOCALES, getDictionary, isLocale, localePath } from "@/lib/i18n";
import {
  breadcrumbJsonLd,
  institutionalMetadata,
  organizationJsonLd,
} from "@/lib/stock/generateMetadata";
import { cn } from "@/lib/utils";

const SERVICES_PATH = "/servicos";

// Cada serviço com sua foto real. weight (venda por peso) recebe destaque e leva
// à landing dedicada; os demais reforçam o contexto operacional da 3WS.
const SERVICES = [
  { key: "buy", image: "/images/gallery/01-compra-moldes-e-equipamentos.webp", href: "/compramos-moldes" },
  { key: "sell", image: "/images/gallery/02-venda-moldes-e-equipamentos.webp", href: "/venda-seu-molde" },
  { key: "broker", image: "/images/gallery/03-intermediacao-comercial.webp", href: null },
  { key: "weight", image: "/images/gallery/04-compra-ferramentas-por-peso.webp", href: "/moldes-por-quilo", feature: true },
  { key: "consulting", image: "/images/gallery/05-avaliacao-consultoria-tecnica.webp", href: null },
] as const;

const STEP_KEYS = ["submit", "evaluate", "propose", "close"] as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return institutionalMetadata(
    locale,
    SERVICES_PATH,
    dict.meta.services.title,
    dict.meta.services.description
  );
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const p = dict.pages.services;

  const crumbs = [
    { name: dict.common.home, path: localePath(locale) },
    { name: p.heading, path: localePath(locale, SERVICES_PATH) },
  ];

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-ink">
        {/* Hero com imagem */}
        <Container className="pt-28 md:pt-32">
          <Breadcrumbs crumbs={crumbs} label={dict.stock.detail.breadcrumbLabel} />
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="lg:col-span-6">
              <SectionLabel label={dict.services.label} />
              <h1 className="mt-6 font-display text-4xl font-medium leading-[1.06] tracking-tight text-white md:text-6xl">
                {p.heading}
              </h1>
              <p className="mt-6 max-w-xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                {p.intro}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={whatsappUrl(dict.header.ctaMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl bg-teal px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-teal-deep"
                >
                  {dict.header.cta}
                </a>
                <Link
                  href={localePath(locale, "/estoque")}
                  className="inline-flex items-center rounded-xl border border-white/15 px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 hover:border-white/30 hover:text-white"
                >
                  {dict.header.nav.stock}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6">
              <PhotoImage
                src="/images/hero-industrial-hall.webp"
                alt={dict.origin.photoAlt}
                priority
                className="aspect-[4/3] w-full"
                sizes="(min-width: 1024px) 48vw, 100vw"
              />
            </div>
          </div>
        </Container>

        {/* Serviços — linhas editoriais com foto real */}
        <section className="mt-20 md:mt-28">
          {SERVICES.map((service, i) => {
            const copy = dict.services.items[service.key];
            const reversed = i % 2 === 1;
            const feature = "feature" in service && service.feature;
            const number = String(i + 1).padStart(2, "0");
            return (
              <div key={service.key} className="border-t border-white/10">
                <Container className="py-14 md:py-20">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-16">
                    <div className={cn("lg:col-span-7", reversed && "lg:order-2")}>
                      <div className="relative">
                        <PhotoImage
                          src={service.image}
                          alt={copy.title}
                          className={cn(
                            "aspect-[16/10] w-full",
                            feature && "ring-1 ring-teal/40"
                          )}
                          sizes="(min-width: 1024px) 58vw, 100vw"
                        />
                        {feature && (
                          <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-teal px-3 py-1.5 font-body text-[11px] font-medium uppercase tracking-[0.14em] text-white shadow-[0_4px_16px_rgba(44,141,255,0.4)]">
                            {dict.servicesBento.weightTag}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={cn("lg:col-span-5", reversed && "lg:order-1")}>
                      <span className="font-display text-sm font-bold tracking-[0.2em] text-teal">
                        {number}
                      </span>
                      <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
                        {copy.title}
                      </h2>
                      <p className="mt-4 font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                        {copy.description}
                      </p>
                      <ul className="mt-6 flex flex-col gap-3">
                        {[copy.feature1, copy.feature2].map((feat) => (
                          <li
                            key={feat}
                            className="flex items-start gap-3 font-body text-sm text-white/70"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                      {service.href && (
                        <Link
                          href={localePath(locale, service.href)}
                          className="mt-7 inline-flex items-center gap-1.5 font-body text-[12px] font-medium uppercase tracking-[0.14em] text-teal transition-transform duration-300 hover:translate-x-0.5"
                        >
                          {dict.servicesBento.cta}
                          <ArrowUpRight size={14} strokeWidth={2} />
                        </Link>
                      )}
                    </div>
                  </div>
                </Container>
              </div>
            );
          })}
        </section>

        {/* Como funciona */}
        <section className="border-t border-white/10 bg-navy-soft/20">
          <Container className="py-16 md:py-20">
            <SectionLabel label={dict.howItWorks.label} />
            <h2 className="mt-6 font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
              {p.howItWorksHeading}
            </h2>
            <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEP_KEYS.map((key, i) => {
                const step = dict.howItWorks.steps[key];
                return (
                  <li key={key} className="flex flex-col gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal/15 font-display text-base font-bold text-teal">
                      {i + 1}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-medium text-white">
                      {step.title}
                    </h3>
                    <p className="font-body text-sm leading-relaxed text-white/55">
                      {step.description}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Container>
        </section>

        {/* CTA */}
        <section className="border-t border-white/10">
          <Container className="flex flex-col items-start gap-6 py-16 md:py-20 lg:items-center lg:text-center">
            <h2 className="max-w-2xl font-display text-3xl font-medium leading-[1.1] tracking-tight text-white md:text-4xl">
              {p.ctaHeading}
            </h2>
            <p className="max-w-xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
              {p.ctaText}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={whatsappUrl(dict.header.ctaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl bg-teal px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-teal-deep"
              >
                {dict.finalCta.cta}
              </a>
              <Link
                href={localePath(locale, "/estoque")}
                className="inline-flex items-center rounded-xl border border-white/15 px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 hover:border-white/30 hover:text-white"
              >
                {dict.header.nav.stock}
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: dict.meta.services.title,
              description: dict.meta.services.description,
              url: absoluteUrl(localePath(locale, SERVICES_PATH)),
              isPartOf: { "@id": `${SITE.url}/#website` },
              mainEntity: SERVICES.map((service) => ({
                "@type": "Service",
                name: dict.services.items[service.key].title,
                description: dict.services.items[service.key].description,
                provider: { "@id": `${SITE.url}/#organization` },
                areaServed: { "@type": "Country", name: "Brazil" },
              })),
            },
            breadcrumbJsonLd(crumbs),
            organizationJsonLd(),
          ]),
        }}
      />
    </>
  );
}
