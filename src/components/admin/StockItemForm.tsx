"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye, Loader2, Save } from "lucide-react";
import { createItem, updateItem, type ImageInput, type ItemInput } from "@/lib/admin/mutations";
import { discardUploads } from "@/lib/admin/uploadActions";
import { STATUS_META, KIND_LABELS, MAX_NOTES_LENGTH, MAX_SUMMARY_LENGTH } from "@/lib/admin/constants";
import { slugify } from "@/lib/admin/slug";
import type { AdminItem, AuditEntry, LocalizedText } from "@/lib/admin/types";
import { getDictionary, type Locale } from "@/lib/i18n";
import { CATEGORY_ORDER, SEGMENT_KEYS, deriveCategoryKey } from "@/lib/stock/taxonomy";
import { STOCK_STATUSES, type StockStatus } from "@/lib/stock/types";
import { PhotoUploader, type PhotoDraft } from "./PhotoUploader";
import {
  Card,
  ErrorBox,
  FIELD_CLASS,
  LABEL_CLASS,
  SuccessBox,
  ghostButtonClass,
  primaryButtonClass,
} from "./ui";

const dict = getDictionary("pt");

const LOCALE_LABELS: Record<Locale, string> = {
  pt: "Português",
  en: "Inglês",
  es: "Espanhol",
};

function toPhotoDraft(image: AdminItem["images"][number]): PhotoDraft {
  return {
    id: image.id,
    type: image.type,
    source: image.source,
    variants: image.variants,
    width: image.width,
    height: image.height,
    color: image.color,
    isCover: image.isCover,
    fileName: image.fileName,
    alt: image.alt,
    isNew: false,
    previewUrl: image.thumbUrl,
  };
}

interface FormState {
  slug: string;
  segment: string;
  categoryKey: string;
  kind: "mold" | "collection";
  status: StockStatus;
  featured: boolean;
  cavities: string;
  volume: string;
  partWeight: string;
  name: LocalizedText;
  title: LocalizedText;
  subject: LocalizedText;
  summary: LocalizedText;
  internalNotes: string;
}

function initialState(item?: AdminItem): FormState {
  return {
    slug: item?.slug ?? "",
    segment: item?.segment ?? "moldes-injecao-plastica",
    categoryKey: item?.categoryKey ?? "diversos",
    kind: item?.kind ?? "mold",
    status: item?.status ?? "draft",
    featured: item?.featured ?? false,
    cavities: item?.cavities != null ? String(item.cavities) : "",
    volume: item?.volume ?? "",
    partWeight: item?.partWeight ?? "",
    name: item?.name ?? {},
    title: item?.title ?? {},
    subject: item?.subject ?? {},
    summary: item?.summary ?? {},
    internalNotes: item?.internalNotes ?? "",
  };
}

export function StockItemForm({
  item,
  history,
}: {
  item?: AdminItem;
  history?: AuditEntry[];
}) {
  const router = useRouter();
  const isEdit = Boolean(item);

  // O id nasce aqui para que as fotos possam ir ao Storage já organizadas por
  // produto, antes do primeiro "Salvar".
  const [itemId] = useState(() => item?.id ?? crypto.randomUUID());
  const [form, setForm] = useState<FormState>(() => initialState(item));
  const [photos, setPhotos] = useState<PhotoDraft[]>(() =>
    (item?.images ?? []).map(toPhotoDraft)
  );
  const [coverId, setCoverId] = useState<string | null>(
    () => item?.images.find((image) => image.isCover)?.id ?? null
  );

  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const orphans = useRef<string[]>([]);

  /** Qualquer alteração marca o formulário como sujo e apaga o "salvo". */
  function change<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setSaved(null);
  }

  function changeLocalized(key: "name" | "title" | "subject" | "summary", locale: Locale, value: string) {
    setForm((current) => ({ ...current, [key]: { ...current[key], [locale]: value } }));
    setDirty(true);
    setSaved(null);
  }

  function changePhotos(next: PhotoDraft[]) {
    setPhotos(next);
    setDirty(true);
    setSaved(null);
  }

  // Aviso do navegador ao fechar a aba com alteração pendente. Só vale para
  // saída "dura"; a navegação interna é coberta pelos botões de voltar.
  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const moldPhotos = useMemo(() => photos.filter((photo) => photo.type === "mold"), [photos]);
  const resultPhotos = useMemo(() => photos.filter((photo) => photo.type === "result"), [photos]);

  // Sem escolha explícita, a capa é a primeira foto do molde — a mesma regra
  // que o site aplica hoje.
  const effectiveCover =
    (coverId && photos.some((photo) => photo.id === coverId) ? coverId : null) ??
    moldPhotos[0]?.id ??
    photos[0]?.id ??
    null;

  /** Reescreve a lista inteira mantendo a ordem relativa de cada seção. */
  function replaceSection(type: "mold" | "result", next: PhotoDraft[]) {
    const other = photos.filter((photo) => photo.type !== type);
    changePhotos(type === "mold" ? [...next, ...other] : [...other, ...next]);
  }

  function movePhoto(id: string) {
    changePhotos(
      photos.map((photo) =>
        photo.id === id
          ? { ...photo, type: photo.type === "mold" ? "result" : "mold" }
          : photo
      )
    );
  }

  function trackOrphans(refs: string[]) {
    orphans.current.push(...refs);
  }

  const derivedSlug = slugify(form.slug || form.name.pt || form.title.pt || "");

  function buildInput(status: StockStatus): ItemInput {
    const images: ImageInput[] = [...moldPhotos, ...resultPhotos].map((photo) => ({
      id: photo.id,
      type: photo.type,
      source: photo.source,
      variants: photo.variants,
      width: photo.width,
      height: photo.height,
      color: photo.color,
      isCover: photo.id === effectiveCover,
      fileName: photo.fileName,
      alt: photo.alt,
    }));

    const cavities = form.cavities.trim() === "" ? null : Number(form.cavities);

    return {
      id: itemId,
      slug: derivedSlug,
      segment: form.segment,
      categoryKey: form.categoryKey,
      kind: form.kind,
      status,
      featured: form.featured,
      cavities: Number.isFinite(cavities) ? cavities : null,
      volume: form.volume,
      partWeight: form.partWeight,
      name: form.name,
      title: form.title,
      subject: form.subject,
      summary: form.summary,
      internalNotes: form.internalNotes,
      images,
    };
  }

  function save(status: StockStatus) {
    setError(null);
    setSaved(null);

    startTransition(async () => {
      const input = buildInput(status);
      const result = isEdit ? await updateItem(itemId, input) : await createItem(input);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // Arquivos enviados e descartados nesta sessão saem do bucket agora que
      // o estado final está salvo.
      if (orphans.current.length > 0) {
        await discardUploads(orphans.current);
        orphans.current = [];
      }

      setDirty(false);
      setForm((current) => ({ ...current, status, slug: result.data.slug }));
      setSaved(
        status === "published"
          ? "Salvo e publicado. Já está no ar nos três idiomas."
          : "Alterações salvas."
      );

      if (!isEdit) router.replace(`/admin/produtos/${itemId}`);
      router.refresh();
    });
  }

  function leave(href: string) {
    if (dirty && !window.confirm("Você tem alterações não salvas. Sair mesmo assim?")) {
      return;
    }
    router.push(href);
  }

  const statusMeta = STATUS_META[form.status];

  return (
    <div className="space-y-6 pb-32">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => leave("/admin")} className={ghostButtonClass()}>
          <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
          Voltar ao painel
        </button>

        {isEdit && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Prévia vale para qualquer status — inclusive rascunho, que por
                definição ainda não existe no site. */}
            <button
              type="button"
              onClick={() => leave(`/admin/produtos/${itemId}/preview`)}
              className={ghostButtonClass()}
            >
              <Eye size={15} strokeWidth={1.75} aria-hidden />
              Pré-visualizar
            </button>

            {item?.status === "published" && (
              <a
                href={`/pt/estoque/${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={ghostButtonClass()}
              >
                <ExternalLink size={15} strokeWidth={1.75} aria-hidden />
                Ver no site
              </a>
            )}
          </div>
        )}
      </div>

      <h1 className="font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
        {isEdit ? item?.displayTitle : "Novo produto"}
      </h1>

      {/* ───────────── informações básicas ───────────── */}
      <Card>
        <h2 className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
          Informações básicas
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="nome-pt" className={LABEL_CLASS}>
              Nome do produto ou molde *
            </label>
            <input
              id="nome-pt"
              value={form.name.pt ?? ""}
              onChange={(event) => changeLocalized("name", "pt", event.target.value)}
              placeholder="Ex.: Copo 250 ml"
              required
              className={FIELD_CLASS}
            />
            <p className="mt-2 font-body text-[12px] leading-relaxed text-white/35">
              O site monta o título sozinho: “Molde para {form.name.pt || "…"}
              {form.cavities ? ` – ${form.cavities} cavidades` : ""}”.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="categoria" className={LABEL_CLASS}>
                Categoria
              </label>
              <select
                id="categoria"
                value={form.categoryKey}
                onChange={(event) => change("categoryKey", event.target.value)}
                className={FIELD_CLASS}
              >
                {CATEGORY_ORDER.map((key) => (
                  <option key={key} value={key}>
                    {dict.stock.categories[key]}
                  </option>
                ))}
              </select>
              {form.name.pt && (
                <button
                  type="button"
                  onClick={() => change("categoryKey", deriveCategoryKey(derivedSlug))}
                  className="mt-2 font-body text-[12px] text-teal underline-offset-4 hover:underline"
                >
                  Sugerir pela descrição
                </button>
              )}
            </div>

            <div>
              <label htmlFor="segmento" className={LABEL_CLASS}>
                Segmento
              </label>
              <select
                id="segmento"
                value={form.segment}
                onChange={(event) => change("segment", event.target.value)}
                className={FIELD_CLASS}
              >
                {SEGMENT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {dict.stock.segments[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className={LABEL_CLASS}>Tipo</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(KIND_LABELS) as (keyof typeof KIND_LABELS)[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => change("kind", key)}
                  aria-pressed={form.kind === key}
                  className={`inline-flex min-h-11 items-center rounded-xl border px-4 font-body text-[14px] outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors focus-visible:ring-2 ${
                    form.kind === key
                      ? "border-teal bg-teal/10 text-teal"
                      : "border-white/15 text-white/65 hover:border-white/35 hover:text-white"
                  }`}
                >
                  {KIND_LABELS[key]}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="descricao" className={LABEL_CLASS}>
              Descrição (opcional)
            </label>
            <textarea
              id="descricao"
              value={form.summary.pt ?? ""}
              onChange={(event) => changeLocalized("summary", "pt", event.target.value)}
              rows={4}
              maxLength={MAX_SUMMARY_LENGTH}
              placeholder="Um parágrafo sobre o molde. Deixe em branco se não houver nada a acrescentar."
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </Card>

      {/* ───────────── dados técnicos ───────────── */}
      <Card>
        <h2 className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
          Dados técnicos
        </h2>
        <p className="mt-2 max-w-xl font-body text-[13px] leading-relaxed text-white/40">
          Todos opcionais. O site só mostra o que você preencher — nada é estimado, e campo
          vazio simplesmente não aparece na página.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="cavidades" className={LABEL_CLASS}>
              Cavidades
            </label>
            <input
              id="cavidades"
              value={form.cavities}
              onChange={(event) => change("cavities", event.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="Ex.: 4"
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label htmlFor="volume" className={LABEL_CLASS}>
              Volume / capacidade
            </label>
            <input
              id="volume"
              value={form.volume}
              onChange={(event) => change("volume", event.target.value)}
              placeholder="Ex.: 250 ml"
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label htmlFor="peso" className={LABEL_CLASS}>
              Peso da peça
            </label>
            <input
              id="peso"
              value={form.partWeight}
              onChange={(event) => change("partWeight", event.target.value)}
              placeholder="Ex.: 40 g"
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </Card>

      {/* ───────────── fotografias ───────────── */}
      <PhotoUploader
        itemId={itemId}
        type="mold"
        photos={moldPhotos}
        allPhotos={photos}
        coverId={effectiveCover}
        onChange={(next) => replaceSection("mold", next)}
        onSetCover={(id) => {
          setCoverId(id);
          setDirty(true);
          setSaved(null);
        }}
        onMove={movePhoto}
        onTrackOrphan={trackOrphans}
      />

      <PhotoUploader
        itemId={itemId}
        type="result"
        photos={resultPhotos}
        allPhotos={photos}
        coverId={effectiveCover}
        onChange={(next) => replaceSection("result", next)}
        onSetCover={(id) => {
          setCoverId(id);
          setDirty(true);
          setSaved(null);
        }}
        onMove={movePhoto}
        onTrackOrphan={trackOrphans}
      />

      {/* ───────────── tradução e URL ───────────── */}
      <details className="group rounded-2xl border border-white/10 bg-white/[0.02]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-white/55 md:p-6">
          Tradução, endereço e observações
          <span aria-hidden className="font-body text-[13px] normal-case tracking-normal text-white/35 group-open:hidden">
            opcional
          </span>
        </summary>

        <div className="space-y-5 border-t border-white/10 p-5 md:p-6">
          <p className="max-w-xl font-body text-[13px] leading-relaxed text-white/40">
            Sem tradução, o site usa o nome em português nas três versões. É proposital:
            mostrar o nome original é melhor do que arriscar uma tradução errada.
          </p>

          {(["en", "es"] as const).map((locale) => (
            <div key={locale}>
              <label htmlFor={`nome-${locale}`} className={LABEL_CLASS}>
                Nome em {LOCALE_LABELS[locale]}
              </label>
              <input
                id={`nome-${locale}`}
                value={form.name[locale] ?? ""}
                onChange={(event) => changeLocalized("name", locale, event.target.value)}
                className={FIELD_CLASS}
              />
            </div>
          ))}

          <div>
            <label htmlFor="slug" className={LABEL_CLASS}>
              Endereço da página
            </label>
            <input
              id="slug"
              value={form.slug}
              onChange={(event) => change("slug", event.target.value)}
              placeholder={derivedSlug || "gerado a partir do nome"}
              className={FIELD_CLASS}
            />
            <p className="mt-2 font-body text-[12px] leading-relaxed text-white/35">
              /pt/estoque/<span className="text-white/60">{derivedSlug || "…"}</span>
              {isEdit && " — mudar isto troca a URL pública; só altere se for mesmo necessário."}
            </p>
          </div>

          <div>
            <label htmlFor="notas" className={LABEL_CLASS}>
              Observações internas
            </label>
            <textarea
              id="notas"
              value={form.internalNotes}
              onChange={(event) => change("internalNotes", event.target.value)}
              rows={3}
              maxLength={MAX_NOTES_LENGTH}
              placeholder="Anotações da equipe. Nunca aparecem no site."
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </details>

      {/* ───────────── histórico ───────────── */}
      {history && history.length > 0 && (
        <Card>
          <h2 className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
            Histórico de alterações
          </h2>
          <ul className="mt-4 space-y-2">
            {history.map((entry) => (
              <li key={entry.id} className="font-body text-[13px] text-white/45">
                <time dateTime={entry.createdAt} className="text-white/65">
                  {new Date(entry.createdAt).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </time>
                {" — "}
                {ACTION_LABELS[entry.action] ?? entry.action}
                {entry.userEmail && ` · ${entry.userEmail}`}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ───────────── barra de salvar ───────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-5 py-4 sm:px-8">
          {error && <ErrorBox>{error}</ErrorBox>}
          {saved && <SuccessBox>{saved}</SuccessBox>}

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="status" className="sr-only">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(event) => change("status", event.target.value as StockStatus)}
                className="min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 font-body text-[14px] text-white outline-none transition-colors focus:border-teal sm:w-auto"
              >
                {STOCK_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {STATUS_META[value].label}
                  </option>
                ))}
              </select>
            </div>

            {form.status !== "published" && (
              <button
                type="button"
                onClick={() => save("published")}
                disabled={pending}
                className={ghostButtonClass("min-h-12")}
              >
                Salvar e publicar
              </button>
            )}

            <button
              type="button"
              onClick={() => save(form.status)}
              disabled={pending}
              className={primaryButtonClass()}
            >
              {pending ? (
                <Loader2 size={16} strokeWidth={1.75} className="animate-spin" aria-hidden />
              ) : (
                <Save size={16} strokeWidth={1.75} aria-hidden />
              )}
              {pending ? "Salvando…" : isEdit ? "Salvar alterações" : "Salvar produto"}
            </button>
          </div>

          <p className="font-body text-[12px] leading-relaxed text-white/35">
            {statusMeta.hint}
            {dirty && " · Há alterações não salvas."}
          </p>
        </div>
      </div>
    </div>
  );
}

const ACTION_LABELS: Record<string, string> = {
  create: "Produto cadastrado",
  update: "Dados alterados",
  status: "Status alterado",
  delete: "Produto excluído",
};
