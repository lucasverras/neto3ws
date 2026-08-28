import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/estoque/Breadcrumbs";
import { SITE, absoluteUrl, whatsappUrl } from "@/lib/site";
import {
  LOCALES,
  OG_LOCALES,
  getDictionary,
  isLocale,
  localePath,
} from "@/lib/i18n";
import {
  breadcrumbJsonLd,
  languageAlternates,
  organizationJsonLd,
} from "@/lib/stock/generateMetadata";

const SERVICES_PATH = "/servicos";

const SERVICE_KEYS = ["buy", "sell", "broker", "weight", "consulting"] as const;
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

  const path = localePath(locale, SERVICES_PATH);
  return {
    title: dict.meta.services.title,
    description: dict.meta.services.description,
    alternates: {
      canonical: path,
      languages: languageAlternates((l) => localePath(l, SERVICES_PATH)),
    },
    openGraph: {
      type: "website",
      title: dict.meta.services.title,
      description: dict.meta.services.description,
      url: absoluteUrl(path),
      siteName: SITE.name,
      locale: OG_LOCALES[locale],
    },
  };
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
        <Container className="pt-28 md:pt-32">
          <Breadcrumbs crumbs={crumbs} label={dict.stock.detail.breadcrumbLabel} />

          <h1 className="mt-8 max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-tight text-white md:text-6xl">
            {p.heading}
          </h1>
          <p className="mt-6 max-w-2xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
            {p.intro}
          </p>
        </Container>

        {/* Serviços */}
        <section className="mt-16 border-t border-white/10">
          <Container className="py-16 md:py-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
              {SERVICE_KEYS.map((key, i) => {
                const service = dict.services.items[key];
                return (
                  <article
                    key={key}
                    className="flex flex-col gap-4 rounded-xl border border-white/10 p-8 transition-colors hover:border-white/20"
                  >
                    <span className="font-body text-xs uppercase tracking-[0.18em] text-teal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-xl font-medium tracking-tight text-white md:text-2xl">
                      {service.title}
                    </h2>
                    <p className="font-body text-[15px] leading-relaxed text-white/60">
                      {service.description}
                    </p>
                    <ul className="mt-2 flex flex-col gap-2">
                      <li className="flex items-start gap-2 font-body text-sm text-white/50">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal/60" />
                        {service.feature1}
                      </li>
                      <li className="flex items-start gap-2 font-body text-sm text-white/50">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal/60" />
                        {service.feature2}
                      </li>
                    </ul>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Como funciona */}
        <section className="border-t border-white/10">
          <Container className="py-16 md:py-20">
            <h2 className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
              {p.howItWorksHeading}
            </h2>
            <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEP_KEYS.map((key, i) => {
                const step = dict.howItWorks.steps[key];
                return (
                  <li key={key} className="flex flex-col gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/15 font-display text-sm font-bold text-teal">
                      {i + 1}
                    </span>
                    <h3 className="font-display text-lg font-medium text-white">
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
        <section className="border-t border-white/10 bg-navy-soft/30">
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
              mainEntity: SERVICE_KEYS.map((key) => ({
                "@type": "Service",
                name: dict.services.items[key].title,
                description: dict.services.items[key].description,
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
