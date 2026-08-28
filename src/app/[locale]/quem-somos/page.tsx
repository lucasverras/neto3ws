import type { Metadata } from "next";
import Image from "next/image";
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
  websiteJsonLd,
} from "@/lib/stock/generateMetadata";

const ABOUT_PATH = "/quem-somos";

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

  const path = localePath(locale, ABOUT_PATH);
  return {
    title: dict.meta.about.title,
    description: dict.meta.about.description,
    alternates: {
      canonical: path,
      languages: languageAlternates((l) => localePath(l, ABOUT_PATH)),
    },
    openGraph: {
      type: "website",
      title: dict.meta.about.title,
      description: dict.meta.about.description,
      url: absoluteUrl(path),
      siteName: SITE.name,
      locale: OG_LOCALES[locale],
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const p = dict.pages.about;

  const crumbs = [
    { name: dict.common.home, path: localePath(locale) },
    { name: p.heading, path: localePath(locale, ABOUT_PATH) },
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

        {/* Valores / Missão */}
        <section className="border-t border-white/10 mt-16">
          <Container className="py-16 md:py-20">
            <h2 className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
              {p.valuesHeading}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <p className="font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                {dict.about.paragraph1}
              </p>
              <p className="font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                {dict.about.paragraph2}
              </p>
            </div>

            {/* Indicadores */}
            <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
              {[
                { value: "1.500+", label: dict.about.indicators.tons },
                { value: "3", label: dict.about.indicators.generations },
                { value: "100%", label: dict.about.indicators.coverage },
                { value: "20.000+", label: dict.about.indicators.negotiated },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <span className="font-display text-3xl font-bold text-teal md:text-4xl">
                    {item.value}
                  </span>
                  <span className="font-body text-sm text-white/50">{item.label}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* História / Origem */}
        <section className="border-t border-white/10">
          <Container className="py-16 md:py-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <Image
                  src="/images/origem-3ws-1000.webp"
                  alt={dict.origin.photoAlt}
                  width={1000}
                  height={667}
                  className="rounded-lg object-cover"
                  sizes="(min-width: 1024px) 40vw, 92vw"
                />
              </div>
              <div className="lg:col-span-7">
                <h2 className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
                  {p.historyHeading}
                </h2>
                <p className="mt-6 font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                  {dict.origin.paragraph1}
                </p>
                <p className="mt-4 font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                  {dict.origin.paragraph2}
                </p>
                <p className="mt-4 font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                  {dict.origin.paragraph3}
                </p>

                <ol className="mt-8 flex flex-col gap-4">
                  {[dict.origin.gen1, dict.origin.gen2, dict.origin.gen3].map(
                    (gen, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/15 font-display text-sm font-bold text-teal">
                          {i + 1}
                        </span>
                        <span className="font-body text-sm leading-relaxed text-white/55">
                          {gen}
                        </span>
                      </li>
                    )
                  )}
                </ol>
              </div>
            </div>
          </Container>
        </section>

        {/* Sustentabilidade */}
        <section className="border-t border-white/10">
          <Container className="py-16 md:py-20">
            <h2 className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
              {p.sustainabilityHeading}
            </h2>
            <p className="mt-6 max-w-2xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
              {p.sustainabilityText}
            </p>
          </Container>
        </section>

        {/* Localização */}
        <section className="border-t border-white/10">
          <Container className="py-16 md:py-20">
            <h2 className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
              {p.locationHeading}
            </h2>
            <p className="mt-4 font-body text-[15px] text-white/60 md:text-base">
              {SITE.address.street}
            </p>
            <p className="mt-1 font-body text-[15px] text-white/60 md:text-base">
              {p.locationText}
            </p>
          </Container>
        </section>

        {/* CTA */}
        <section className="border-t border-white/10 bg-navy-soft/30">
          <Container className="flex flex-col items-start gap-6 py-16 md:py-20 lg:items-center lg:text-center">
            <h2 className="max-w-2xl font-display text-3xl font-medium leading-[1.1] tracking-tight text-white md:text-4xl">
              {dict.finalCta.heading}
            </h2>
            <p className="max-w-xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
              {dict.finalCta.description}
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
                href={localePath(locale, "/servicos")}
                className="inline-flex items-center rounded-xl border border-white/15 px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 hover:border-white/30 hover:text-white"
              >
                {dict.header.nav.services}
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
              "@type": "AboutPage",
              name: dict.meta.about.title,
              description: dict.meta.about.description,
              url: absoluteUrl(localePath(locale, ABOUT_PATH)),
              isPartOf: { "@id": `${SITE.url}/#website` },
            },
            breadcrumbJsonLd(crumbs),
            organizationJsonLd(),
          ]),
        }}
      />
    </>
  );
}
