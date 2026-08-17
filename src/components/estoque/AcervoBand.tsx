import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StockPhoto } from "./StockPhoto";
import type { Dictionary } from "@/lib/i18n";
import type { StockImage } from "@/lib/stock/types";

/**
 * Prova visual do estoque, montada com as fotos do acervo geral. Não é um
 * produto e por isso não tem URL própria — é contexto para o catálogo abaixo.
 */
export function AcervoBand({ photos, dict }: { photos: StockImage[]; dict: Dictionary }) {
  const d = dict.stock.acervo;
  if (photos.length === 0) return null;
  const [lead, ...rest] = photos.slice(0, 5);

  return (
    <section aria-labelledby="acervo-heading" className="bg-ink py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionLabel label={d.label} />
            <h2
              id="acervo-heading"
              className="mt-6 font-display text-3xl font-medium leading-[1.1] tracking-tight text-white md:text-4xl"
            >
              {d.heading}
            </h2>
            <p className="mt-5 font-body text-[15px] leading-relaxed text-white/60">
              {d.text}
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <div className="col-span-2 row-span-2">
                <div className="relative aspect-4/3 overflow-hidden rounded-lg border border-white/10 bg-navy-soft md:aspect-square">
                  <StockPhoto
                    image={lead}
                    sizes="(min-width: 1024px) 40vw, 92vw"
                    maxWidth={800}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              {rest.map((photo, index) => (
                <div
                  key={photo.base}
                  // As duas últimas só entram a partir de md: no celular a
                  // faixa ficaria alta demais antes de o catálogo aparecer.
                  className={`relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-navy-soft ${
                    index >= 2 ? "hidden md:block" : ""
                  }`}
                >
                  <StockPhoto
                    image={photo}
                    sizes="(min-width: 1024px) 20vw, 45vw"
                    maxWidth={800}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
