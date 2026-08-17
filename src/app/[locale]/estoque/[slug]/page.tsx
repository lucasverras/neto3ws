import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/estoque/Breadcrumbs";
import { MoldGallery } from "@/components/estoque/MoldGallery";
import { StockContactCTA } from "@/components/estoque/StockContactCTA";
import { StockPhoto } from "@/components/estoque/StockPhoto";
import { LOCALES, getDictionary, isLocale, t } from "@/lib/i18n";
import { cavityLabel } from "@/lib/stock/normalizeTitle";
import { getRelatedItems, getStockItem, getStockSlugs } from "@/lib/stock/parseStock";
import {
  breadcrumbJsonLd,
  buildItemMetadata,
  itemBreadcrumbs,
  productJsonLd,
  stockItemPath,
  stockPath,
} from "@/lib/stock/generateMetadata";

/** 40 moldes × 3 idiomas = 120 páginas estáticas. Nada é gerado sob demanda. */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => getStockSlugs().map((slug) => ({ locale, slug })));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const item = getStockItem(locale, slug);
  if (!item) return {};
  return buildItemMetadata(locale, getDictionary(locale), item);
}

export default async function MoldPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const item = getStockItem(locale, slug);
  if (!item) notFound();

  const crumbs = itemBreadcrumbs(locale, dict, item);
  const related = getRelatedItems(locale, item);
  const d = dict.stock.detail;

  const photoWord = (n: number) =>
    `${n} ${n === 1 ? d.photoCountOne : d.photoCountMany}`;

  // Só entram fatos que o próprio acervo declara. Material, dimensões, aço,
  // fabricante, tonelagem, condição e preço não são exibidos porque não são
  // conhecidos — e não serão inferidos das fotos.
  const specs = [
    { label: d.specs.category, value: item.category },
    { label: d.specs.line, value: item.segmentLabel },
    item.cavities
      ? { label: d.specs.cavities, value: cavityLabel(dict, item.cavities) }
      : null,
    item.volume ? { label: d.specs.volume, value: item.volume } : null,
    item.partWeight ? { label: d.specs.weight, value: item.partWeight } : null,
    {
      label: d.specs.photos,
      value:
        item.resultImages.length > 0
          ? `${item.moldImages.length} ${d.specs.photosMold} · ${item.resultImages.length} ${d.specs.photosPart}`
          : photoWord(item.images.length),
    },
  ].filter((spec): spec is { label: string; value: string } => spec !== null);

  const summary =
    item.summary ??
    t(item.kind === "collection" ? d.summaryCollection : d.summaryMold, {
      subject: item.subject,
    });

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-ink pt-28 md:pt-32">
        <Container>
          <Breadcrumbs crumbs={crumbs} label={d.breadcrumbLabel} />

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <p className="font-body text-xs uppercase tracking-[0.24em] text-teal">
                {item.category}
              </p>
              <h1 className="mt-4 max-w-2xl font-display text-3xl font-medium leading-[1.08] tracking-tight text-white md:text-5xl">
                {item.title}
              </h1>
              <p className="mt-6 max-w-xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                {summary}
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-4/3 overflow-hidden rounded-lg border border-white/10 bg-navy-soft">
                <StockPhoto
                  image={item.cover}
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <section aria-labelledby="sobre-molde" className="mt-16 border-t border-white/10 pt-10">
            <h2
              id="sobre-molde"
              className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl"
            >
              {d.about}
            </h2>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
              {specs.map((spec) => (
                <div key={spec.label} className="flex flex-col gap-2">
                  <dt className="font-body text-[11px] uppercase tracking-[0.14em] text-white/40">
                    {spec.label}
                  </dt>
                  <dd className="font-display text-[17px] font-medium leading-snug text-white">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 max-w-2xl font-body text-[14px] leading-relaxed text-white/45">
              {d.disclaimer}
            </p>
          </section>

          <div className="mt-16">
            <MoldGallery
              slug={item.slug}
              label={item.shortTitle}
              moldImages={item.moldImages}
              resultImages={item.resultImages}
              dict={dict}
            />
          </div>

          <div className="mt-20">
            <StockContactCTA item={item} dict={dict} />
          </div>

          {related.length > 0 && (
            <section aria-labelledby="relacionados" className="mt-20 border-t border-white/10 pt-12">
              <h2
                id="relacionados"
                className="font-body text-xs uppercase tracking-[0.24em] text-white/40"
              >
                {d.related}
              </h2>
              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
                {related.map((other) => (
                  <li key={other.slug}>
                    <Link href={stockItemPath(locale, other.slug)} className="group block">
                      <div className="relative aspect-4/5 overflow-hidden rounded-lg border border-white/10 bg-navy-soft">
                        <StockPhoto
                          image={other.cover}
                          sizes="(min-width: 768px) 22vw, 45vw"
                          maxWidth={800}
                          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                        />
                      </div>
                      <h3 className="mt-3 font-display text-[15px] font-medium leading-snug text-white/85 transition-colors group-hover:text-teal">
                        {other.shortTitle}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="py-16">
            <Link
              href={stockPath(locale)}
              className="inline-flex items-center gap-2 font-body text-[14px] text-white/55 transition-colors hover:text-teal"
            >
              <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
              {d.back}
            </Link>
          </div>
        </Container>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            productJsonLd(locale, dict, item),
            breadcrumbJsonLd(crumbs),
          ]),
        }}
      />
    </>
  );
}
