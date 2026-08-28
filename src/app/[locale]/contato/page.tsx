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

const CONTACT_PATH = "/contato";

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

  const path = localePath(locale, CONTACT_PATH);
  return {
    title: dict.meta.contact.title,
    description: dict.meta.contact.description,
    alternates: {
      canonical: path,
      languages: languageAlternates((l) => localePath(l, CONTACT_PATH)),
    },
    openGraph: {
      type: "website",
      title: dict.meta.contact.title,
      description: dict.meta.contact.description,
      url: absoluteUrl(path),
      siteName: SITE.name,
      locale: OG_LOCALES[locale],
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const p = dict.pages.contact;

  const crumbs = [
    { name: dict.common.home, path: localePath(locale) },
    { name: p.heading, path: localePath(locale, CONTACT_PATH) },
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

        {/* Informações de contato */}
        <section className="mt-16 border-t border-white/10">
          <Container className="py-16 md:py-20">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="flex flex-col gap-3">
                <h2 className="font-body text-xs uppercase tracking-[0.18em] text-white/40">
                  {p.emailLabel}
                </h2>
                <a
                  href={`mailto:${SITE.email}`}
                  className="font-display text-lg font-medium text-white transition-colors hover:text-teal"
                >
                  {SITE.email}
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="font-body text-xs uppercase tracking-[0.18em] text-white/40">
                  {p.phoneLabel}
                </h2>
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-lg font-medium text-white transition-colors hover:text-teal"
                >
                  {SITE.phoneLabel}
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="font-body text-xs uppercase tracking-[0.18em] text-white/40">
                  {p.addressLabel}
                </h2>
                <p className="font-display text-lg font-medium leading-snug text-white">
                  {SITE.address.street}
                </p>
                <p className="font-body text-sm text-white/50">
                  {SITE.address.locality}/{SITE.address.region} — CEP{" "}
                  {SITE.address.postalCode}
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Como podemos ajudar */}
        <section className="border-t border-white/10">
          <Container className="py-16 md:py-20">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
                  {p.formHeading}
                </h2>
                <p className="mt-6 font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                  {p.formText}
                </p>
                <a
                  href={whatsappUrl(p.sendMessageText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center rounded-xl bg-teal px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-teal-deep"
                >
                  {p.sendMessage}
                </a>
              </div>

              <div className="flex flex-col gap-6 rounded-xl border border-white/10 p-8">
                <h3 className="font-display text-lg font-medium text-white">
                  {dict.header.nav.services}
                </h3>
                <ul className="flex flex-col gap-3">
                  {(["buy", "sell", "broker", "weight", "consulting"] as const).map(
                    (key) => (
                      <li key={key}>
                        <Link
                          href={localePath(locale, "/servicos")}
                          className="flex items-start gap-2 font-body text-sm text-white/55 transition-colors hover:text-teal"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal/60" />
                          {dict.services.items[key].title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
                <Link
                  href={localePath(locale, "/estoque")}
                  className="mt-2 font-body text-sm text-teal transition-colors hover:text-teal-deep"
                >
                  {dict.header.nav.stock} →
                </Link>
              </div>
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
              "@type": "ContactPage",
              name: dict.meta.contact.title,
              description: dict.meta.contact.description,
              url: absoluteUrl(localePath(locale, CONTACT_PATH)),
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
