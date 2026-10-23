import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { MoldGallery } from "@/components/estoque/MoldGallery";
import { StockPhoto } from "@/components/estoque/StockPhoto";
import { StatusBadge, ghostButtonClass } from "@/components/admin/ui";
import { getAdminUser } from "@/lib/admin/auth";
import { getAdminItem, getItemPreview } from "@/lib/admin/queries";
import { getDictionary, t } from "@/lib/i18n";
import { cavityLabel } from "@/lib/stock/normalizeTitle";

export const dynamic = "force-dynamic";

/**
 * Pré-visualização dentro do painel.
 *
 * Usa os mesmos componentes da página pública (`StockPhoto`, `MoldGallery`) e
 * o mesmo `buildItem`, então o que aparece aqui é o que o visitante veria —
 * inclusive para um rascunho, que a RLS esconde do site e deve continuar
 * escondendo.
 */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const admin = await getAdminUser();
  if (!admin) redirect(`/admin/login?next=/admin/produtos/${id}/preview`);

  const [item, record] = await Promise.all([getItemPreview(id, "pt"), getAdminItem(id)]);
  if (!item || !record) notFound();

  const dict = getDictionary("pt");
  const d = dict.stock.detail;

  const specs = [
    { label: d.specs.category, value: item.category },
    { label: d.specs.line, value: item.segmentLabel },
    item.cavities ? { label: d.specs.cavities, value: cavityLabel(dict, item.cavities) } : null,
    item.volume ? { label: d.specs.volume, value: item.volume } : null,
    item.partWeight ? { label: d.specs.weight, value: item.partWeight } : null,
  ].filter((spec): spec is { label: string; value: string } => spec !== null);

  const summary =
    item.summary ??
    t(item.kind === "collection" ? d.summaryCollection : d.summaryMold, {
      subject: item.subject,
    });

  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/produtos/${id}`} className={ghostButtonClass()}>
          <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
          Voltar à edição
        </Link>
        <StatusBadge status={record.status} />
      </div>

      <p className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 font-body text-[13px] text-white/55">
        <Eye size={15} strokeWidth={1.75} aria-hidden className="text-teal" />
        Prévia — é assim que a página fica no site, em português.
      </p>

      {/* ── daqui para baixo, o mesmo desenho da página pública ── */}
      <div className="mt-8">
        <p className="font-body text-xs uppercase tracking-[0.24em] text-teal">
          {item.category}
        </p>
        <h1 className="mt-4 font-display text-3xl font-medium leading-[1.08] tracking-tight text-white md:text-4xl">
          {item.title}
        </h1>
        <p className="mt-6 max-w-xl font-body text-[15px] leading-relaxed text-white/60">
          {summary}
        </p>
      </div>

      {item.images.length > 0 ? (
        <>
          <div className="mt-8 aspect-4/3 overflow-hidden rounded-lg border border-white/10 bg-navy-soft">
            <StockPhoto
              image={item.cover}
              sizes="(min-width: 768px) 60vw, 92vw"
              priority
              className="h-full w-full object-cover"
            />
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3">
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

          <div className="mt-12">
            <MoldGallery
              slug={item.slug}
              label={item.shortTitle}
              moldImages={item.moldImages}
              resultImages={item.resultImages}
              dict={dict}
            />
          </div>
        </>
      ) : (
        <p className="mt-8 rounded-2xl border border-amber-400/35 bg-amber-400/[0.07] px-5 py-8 font-body text-[14px] leading-relaxed text-amber-100">
          Este produto ainda não tem fotografias. No site ele apareceria sem imagem no
          card — vale adicionar pelo menos uma antes de publicar.
        </p>
      )}
    </div>
  );
}
