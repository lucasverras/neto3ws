import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Breadcrumbs } from "@/components/estoque/Breadcrumbs";
import { StockCard } from "@/components/estoque/StockCard";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { SITE, absoluteUrl, whatsappUrl } from "@/lib/site";
import { getStockItems } from "@/lib/stock/parseStock";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  stockPath,
} from "@/lib/stock/generateMetadata";
import {
  getLandingContent,
  landingNav,
  landingRelated,
  type LandingSlug,
} from "@/lib/landing/content";

export function landingPath(locale: Locale, slug: LandingSlug) {
  return localePath(locale, `/${slug}`);
}

/** Página institucional/comercial montada a partir do conteúdo em content.ts. */
export function LandingPage({ locale, slug }: { locale: Locale; slug: LandingSlug }) {
  const dict = getDictionary(locale);
  const c = getLandingContent(locale, slug);

  const crumbs = [
    { name: dict.common.home, path: localePath(locale) },
    { name: c.h1, path: landingPath(locale, slug) },
  ];

  // Páginas de categoria: itens reais do catálogo (conteúdo único + links
  // internos rastreáveis, o oposto de uma doorway page).
  const categoryItems = c.category
    ? getStockItems(locale).filter((item) => item.categoryKey === c.category)
    : [];
  const categoryHref = c.category
    ? `${stockPath(locale)}?categoria=${c.category}`
    : stockPath(locale);

  const related = landingRelated[slug].map((s) => ({
    label: landingNav[s][locale],
    href: landingPath(locale, s),
  }));

  const faqLd = faqJsonLd(c.faq.map((f) => ({ q: f.q, a: f.a })));
  const pageLd = c.category
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: c.metaTitle,
        description: c.metaDescription,
        url: absoluteUrl(landingPath(locale, slug)),
        isPartOf: { "@id": `${SITE.url}/#website` },
        ...(categoryItems.length > 0
          ? {
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: categoryItems.length,
                itemListElement: categoryItems.map((item, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: item.title,
                  url: absoluteUrl(localePath(locale, `/estoque/${item.slug}`)),
                })),
              },
            }
          : {}),
      }
    : {
        "@context": "https://schema.org",
        "@type": "Service",
        name: c.h1,
        description: c.metaDescription,
        url: absoluteUrl(landingPath(locale, slug)),
        provider: { "@id": `${SITE.url}/#organization` },
        areaServed: [
          { "@type": "City", name: "São Paulo" },
          { "@type": "Country", name: "Brazil" },
        ],
      };

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-ink">
        <Container className="pt-28 md:pt-32">
          <Breadcrumbs crumbs={crumbs} label={dict.stock.detail.breadcrumbLabel} />
        </Container>

        {/* Hero */}
        <Container className="pt-8 md:pt-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <SectionLabel label={c.eyebrow} />
              <h1 className="mt-6 font-display text-4xl font-medium leading-[1.06] tracking-tight text-white md:text-5xl lg:text-6xl">
                {c.h1}
              </h1>
              <p className="mt-6 max-w-xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                {c.intro}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={whatsappUrl(c.ctaMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl bg-teal px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-teal-deep"
                >
                  {c.cta}
                </a>
                <Link
                  href={categoryHref}
                  className="inline-flex items-center rounded-xl border border-white/15 px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 hover:border-white/30 hover:text-white"
                >
                  {dict.header.nav.stock}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6">
              <PhotoImage
                src={c.heroImage.src}
                alt={c.heroImage.alt}
                priority
                className="aspect-[4/3] w-full"
                sizes="(min-width: 1024px) 48vw, 100vw"
              />
            </div>
          </div>
        </Container>

        {/* Conteúdo */}
        <div className="mt-20 md:mt-28">
          {c.sections.map((section, i) => (
            <section
              key={section.heading}
              className={i === 0 ? "border-t border-white/10" : "border-t border-white/10"}
            >
              <Container className="py-14 md:py-16">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                  <h2 className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl lg:col-span-5">
                    {section.heading}
                  </h2>
                  <div className="lg:col-span-7">
                    {section.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mb-4 font-body text-[15px] leading-relaxed text-white/60 last:mb-0 md:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets && (
                      <ul className="mt-6 flex flex-col gap-3">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-3 font-body text-[15px] text-white/70"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Container>
            </section>
          ))}

          {/* Galeria de fotos reais */}
          {c.gallery && c.gallery.length > 0 && (
            <section className="border-t border-white/10">
              <Container className="py-14 md:py-16">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {c.gallery.map((photo) => (
                    <PhotoImage
                      key={photo.src}
                      src={photo.src}
                      alt={photo.alt}
                      className="aspect-[4/3] w-full"
                      sizes="(min-width: 640px) 32vw, 100vw"
                    />
                  ))}
                </div>
              </Container>
            </section>
          )}

          {/* Grade de itens reais da categoria */}
          {c.category && (
            <section className="border-t border-white/10">
              <Container className="py-14 md:py-16">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h2 className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
                    {c.categoryGridHeading}
                  </h2>
                  <Link
                    href={categoryHref}
                    className="inline-flex items-center gap-1.5 font-body text-sm text-teal transition-colors hover:text-teal-deep"
                  >
                    {dict.stock.browser.all} <ArrowUpRight size={15} strokeWidth={2} />
                  </Link>
                </div>
                {categoryItems.length > 0 ? (
                  <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                    {categoryItems.slice(0, 8).map((item, i) => (
                      <StockCard
                        key={item.slug}
                        item={item}
                        locale={locale}
                        dict={dict}
                        priority={i < 4}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 max-w-2xl font-body text-[15px] leading-relaxed text-white/55">
                    {c.categoryEmpty}
                  </p>
                )}
              </Container>
            </section>
          )}

          {/* FAQ visível (base do FAQPage schema) */}
          <section className="border-t border-white/10">
            <Container className="py-14 md:py-16">
              <h2 className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
                {dict.faq.heading}
              </h2>
              <dl className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-16">
                {c.faq.map((item) => (
                  <div key={item.q}>
                    <dt className="font-display text-lg font-medium text-white">{item.q}</dt>
                    <dd className="mt-2 font-body text-[15px] leading-relaxed text-white/60">
                      {item.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </Container>
          </section>

          {/* Links internos */}
          <section className="border-t border-white/10">
            <Container className="py-14 md:py-16">
              <SectionLabel label={dict.header.nav.services} />
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {related.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-white/10 px-6 py-5 transition-colors hover:border-white/25"
                  >
                    <span className="font-display text-[15px] font-medium text-white">
                      {link.label}
                    </span>
                    <ArrowUpRight
                      size={18}
                      strokeWidth={2}
                      className="text-teal transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                ))}
              </div>
            </Container>
          </section>

          {/* CTA final */}
          <section className="border-t border-white/10 bg-navy-soft/30">
            <Container className="flex flex-col items-start gap-6 py-16 md:py-20 lg:items-center lg:text-center">
              <h2 className="max-w-2xl font-display text-3xl font-medium leading-[1.1] tracking-tight text-white md:text-4xl">
                {c.finalHeading}
              </h2>
              <p className="max-w-xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                {c.finalText}
              </p>
              <a
                href={whatsappUrl(c.ctaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl bg-teal px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-teal-deep"
              >
                {c.cta}
              </a>
            </Container>
          </section>
        </div>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            pageLd,
            breadcrumbJsonLd(crumbs),
            faqLd,
            organizationJsonLd(),
            localBusinessJsonLd(),
          ]),
        }}
      />
    </>
  );
}
