import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { AcervoBand } from "@/components/estoque/AcervoBand";
import { Breadcrumbs } from "@/components/estoque/Breadcrumbs";
import { StockBrowser } from "@/components/estoque/StockBrowser";
import { StockHero } from "@/components/estoque/StockHero";
import { SITE, absoluteUrl, whatsappUrl } from "@/lib/site";
import {
  OG_LOCALES,
  getDictionary,
  isLocale,
  localePath,
} from "@/lib/i18n";
import { largestVariant } from "@/lib/stock/imageUrl";
import {
  getCatalog,
  getStockCategories,
} from "@/lib/stock/parseStock";
import {
  breadcrumbJsonLd,
  collectionJsonLd,
  languageAlternates,
  organizationJsonLd,
  stockItemPath,
  stockPath,
} from "@/lib/stock/generateMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const institutional = getCatalog(locale).institutional;

  return {
    title: dict.meta.stock.title,
    description: dict.meta.stock.description,
    alternates: {
      canonical: stockPath(locale),
      languages: languageAlternates((l) => stockPath(l)),
    },
    openGraph: {
      type: "website",
      title: dict.meta.stock.title,
      description: dict.meta.stock.description,
      url: absoluteUrl(stockPath(locale)),
      siteName: SITE.name,
      locale: OG_LOCALES[locale],
      images: institutional
        ? [
            {
              url: absoluteUrl(largestVariant(institutional.cover)),
              alt: institutional.cover.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.stock.title,
      description: dict.meta.stock.description,
    },
  };
}

export default async function EstoquePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const { items, institutional, totals } = getCatalog(locale);
  const categories = getStockCategories(locale);
  const acervoPhotos = institutional?.images ?? [];

  const crumbs = [
    { name: dict.common.home, path: localePath(locale) },
    { name: dict.header.nav.stock, path: stockPath(locale) },
  ];

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-ink">
        <Container className="pt-28 md:pt-32">
          <Breadcrumbs crumbs={crumbs} label={dict.stock.detail.breadcrumbLabel} />
        </Container>

        <StockHero photo={acervoPhotos[0] ?? null} totals={totals} locale={locale} dict={dict} />

        <AcervoBand photos={acervoPhotos.slice(1)} dict={dict} />

        <StockBrowser items={items} categories={categories} locale={locale} dict={dict} />

        <section
          aria-labelledby="estoque-contato"
          className="border-t border-white/10 bg-ink py-24 md:py-32"
        >
          <Container className="flex flex-col items-start gap-8 lg:items-center lg:text-center">
            <h2
              id="estoque-contato"
              className="max-w-3xl font-display text-3xl font-medium leading-[1.1] tracking-tight text-white md:text-5xl"
            >
              {dict.stock.contactSection.heading}
            </h2>
            <p className="max-w-xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
              {dict.stock.contactSection.text}
            </p>
            <a
              href={whatsappUrl(dict.stock.contactSection.ctaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-teal px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_4px_20px_rgba(44,141,255,0.35)] outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors duration-300 hover:bg-teal-deep focus-visible:ring-2"
            >
              {dict.stock.contactSection.cta}
            </a>
          </Container>
        </section>

        {/* Lista completa em HTML estático: garante que o rastreador chegue a
            todas as URLs de molde mesmo sem executar o "Carregar mais". */}
        <nav aria-label={dict.stock.allMolds.navLabel} className="border-t border-white/10 bg-ink">
          <Container className="py-14">
            <h2 className="font-body text-xs uppercase tracking-[0.24em] text-white/40">
              {dict.stock.allMolds.heading}
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={stockItemPath(locale, item.slug)}
                    className="font-body text-[14px] text-white/50 transition-colors hover:text-teal"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            collectionJsonLd(locale, dict, items, dict.meta.stock.description),
            breadcrumbJsonLd(crumbs),
            organizationJsonLd(),
          ]),
        }}
      />
    </>
  );
}
