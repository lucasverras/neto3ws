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
import { cavityLabel } from "@/lib/stock/normalizeTitle";
import { STOCK_ITEMS, getRelatedItems, getStockItem } from "@/lib/stock/parseStock";
import {
  STOCK_PATH,
  breadcrumbJsonLd,
  buildItemMetadata,
  itemBreadcrumbs,
  productJsonLd,
  stockItemPath,
} from "@/lib/stock/generateMetadata";

/** Todas as páginas de molde são estáticas — nada é gerado sob demanda. */
export function generateStaticParams() {
  return STOCK_ITEMS.map((item) => ({ slug: item.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getStockItem(slug);
  if (!item) return {};
  return buildItemMetadata(item);
}

export default async function MoldPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getStockItem(slug);
  if (!item) notFound();

  const crumbs = itemBreadcrumbs(item);
  const related = getRelatedItems(item);

  // Só entram fatos que o próprio acervo declara. Material, dimensões, aço,
  // fabricante, tonelagem, condição e preço não são exibidos porque não são
  // conhecidos — e não serão inferidos das fotos.
  const specs = [
    { label: "Categoria", value: item.category },
    { label: "Linha", value: item.segmentLabel },
    item.cavities ? { label: "Cavidades", value: cavityLabel(item.cavities) } : null,
    item.volume ? { label: "Volume da peça", value: item.volume } : null,
    item.partWeight ? { label: "Peso da peça", value: item.partWeight } : null,
    {
      label: "Registro fotográfico",
      value:
        item.resultImages.length > 0
          ? `${item.moldImages.length} do molde · ${item.resultImages.length} da peça`
          : `${item.images.length} ${item.images.length === 1 ? "foto" : "fotos"}`,
    },
  ].filter((spec): spec is { label: string; value: string } => spec !== null);

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-ink pt-28 md:pt-32">
        <Container>
          <Breadcrumbs crumbs={crumbs} />

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <p className="font-body text-xs uppercase tracking-[0.24em] text-teal">
                {item.category}
              </p>
              <h1 className="mt-4 max-w-2xl font-display text-3xl font-medium leading-[1.08] tracking-tight text-white md:text-5xl">
                {item.title}
              </h1>
              <p className="mt-6 max-w-xl font-body text-[15px] leading-relaxed text-white/60 md:text-base">
                {item.summary ??
                  (item.kind === "collection"
                    ? `Conjunto de moldes de injeção plástica para ${item.subject}, disponíveis no estoque da 3WS para compra, venda ou intermediação.`
                    : `Molde de injeção plástica para ${item.subject}, disponível no estoque da 3WS para compra, venda ou intermediação.`)}
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
              Sobre este molde
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
              As informações acima vêm da identificação do próprio molde no
              acervo. Dimensões, material, condição e demais especificações
              técnicas são conferidas e enviadas sob consulta.
            </p>
          </section>

          <div className="mt-16">
            <MoldGallery
              slug={item.slug}
              label={item.shortTitle}
              moldImages={item.moldImages}
              resultImages={item.resultImages}
            />
          </div>

          <div className="mt-20">
            <StockContactCTA item={item} />
          </div>

          {related.length > 0 && (
            <section aria-labelledby="relacionados" className="mt-20 border-t border-white/10 pt-12">
              <h2
                id="relacionados"
                className="font-body text-xs uppercase tracking-[0.24em] text-white/40"
              >
                Outros moldes no estoque
              </h2>
              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
                {related.map((other) => (
                  <li key={other.slug}>
                    <Link href={stockItemPath(other.slug)} className="group block">
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
              href={STOCK_PATH}
              className="inline-flex items-center gap-2 font-body text-[14px] text-white/55 transition-colors hover:text-teal"
            >
              <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
              Voltar para o estoque
            </Link>
          </div>
        </Container>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productJsonLd(item), breadcrumbJsonLd(crumbs)]),
        }}
      />
    </>
  );
}
