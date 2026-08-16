import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { AcervoBand } from "@/components/estoque/AcervoBand";
import { Breadcrumbs } from "@/components/estoque/Breadcrumbs";
import { StockBrowser } from "@/components/estoque/StockBrowser";
import { StockHero } from "@/components/estoque/StockHero";
import { SITE, absoluteUrl, whatsappUrl } from "@/lib/site";
import { largestVariant } from "@/lib/stock/imageUrl";
import {
  INSTITUTIONAL_ITEM,
  STOCK_ITEMS,
  STOCK_TOTALS,
  getStockCategories,
} from "@/lib/stock/parseStock";
import {
  STOCK_PATH,
  breadcrumbJsonLd,
  collectionJsonLd,
  organizationJsonLd,
  stockItemPath,
} from "@/lib/stock/generateMetadata";

const DESCRIPTION =
  "Conheça o estoque de moldes de injeção plástica da 3WS. Moldes novos e usados para utilidades domésticas, automotivo, brinquedos, copos, bandejas e outros segmentos, com fotos do molde e da peça produzida.";

export const metadata: Metadata = {
  title: "Estoque de Moldes de Injeção Plástica | 3WS Moldes",
  description: DESCRIPTION,
  alternates: { canonical: STOCK_PATH },
  openGraph: {
    type: "website",
    title: "Estoque de Moldes de Injeção Plástica | 3WS Moldes",
    description: DESCRIPTION,
    url: absoluteUrl(STOCK_PATH),
    siteName: SITE.name,
    locale: "pt_BR",
    images: INSTITUTIONAL_ITEM
      ? [
          {
            url: absoluteUrl(largestVariant(INSTITUTIONAL_ITEM.cover)),
            alt: INSTITUTIONAL_ITEM.cover.alt,
          },
        ]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "Estoque de Moldes de Injeção Plástica | 3WS Moldes",
    description: DESCRIPTION,
  },
};

const CRUMBS = [
  { name: "Início", path: "/" },
  { name: "Estoque", path: STOCK_PATH },
];

export default function EstoquePage() {
  const categories = getStockCategories();
  const acervoPhotos = INSTITUTIONAL_ITEM?.images ?? [];

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-ink">
        <Container className="pt-28 md:pt-32">
          <Breadcrumbs crumbs={CRUMBS} />
        </Container>

        <StockHero photo={acervoPhotos[0] ?? null} totals={STOCK_TOTALS} />

        <AcervoBand photos={acervoPhotos.slice(1)} />

        <StockBrowser items={STOCK_ITEMS} categories={categories} />

        <section
          aria-labelledby="estoque-contato"
          className="border-t border-white/10 bg-ink py-24 md:py-32"
        >
          <Container className="flex flex-col items-start gap-8 lg:items-center lg:text-center">
            <h2
              id="estoque-contato"
              className="max-w-3xl font-display text-3xl font-medium leading-[1.1] tracking-tight text-white md:text-5xl"
            >
              Procura um molde específico que não está no catálogo?
            </h2>
            <p className="max-w-xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
              O estoque da 3WS gira constantemente. Descreva a peça que você
              precisa produzir e nossa equipe verifica o acervo completo.
            </p>
            <a
              href={whatsappUrl("Olá, procuro um molde específico. Podem verificar o estoque da 3WS?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-teal px-8 py-4 font-body text-[13px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_4px_20px_rgba(44,141,255,0.35)] outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors duration-300 hover:bg-teal-deep focus-visible:ring-2"
            >
              Falar sobre um molde
            </a>
          </Container>
        </section>

        {/* Lista completa em HTML estático: garante que o rastreador chegue a
            todas as URLs de molde mesmo sem executar o "Carregar mais". */}
        <nav aria-label="Todos os moldes do catálogo" className="border-t border-white/10 bg-ink">
          <Container className="py-14">
            <h2 className="font-body text-xs uppercase tracking-[0.24em] text-white/40">
              Todos os moldes do estoque
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {STOCK_ITEMS.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={stockItemPath(item.slug)}
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
            collectionJsonLd(STOCK_ITEMS, DESCRIPTION),
            breadcrumbJsonLd(CRUMBS),
            organizationJsonLd(),
          ]),
        }}
      />
    </>
  );
}
