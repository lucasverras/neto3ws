"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowUpDown,
  ExternalLink,
  GripVertical,
  ImageOff,
  Images,
  Landmark,
  Loader2,
  Pencil,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { STATUS_META } from "@/lib/admin/constants";
import {
  deleteItem,
  duplicateItem,
  reorderItems,
  setItemFeatured,
  setItemStatus,
} from "@/lib/admin/mutations";
import type { AdminItem } from "@/lib/admin/types";
import { CATEGORY_ORDER } from "@/lib/stock/taxonomy";
import { STOCK_STATUSES, type StockStatus } from "@/lib/stock/types";
import { getDictionary } from "@/lib/i18n";
import { ActionsMenu, buildActions } from "./RowActions";
import { ErrorBox, ghostButtonClass } from "./ui";

const dict = getDictionary("pt");

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function Thumb({ item }: { item: AdminItem }) {
  const cover = item.images.find((image) => image.isCover) ?? item.images[0];

  if (!cover?.thumbUrl) {
    return (
      <div
        aria-hidden
        className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-white/25 sm:size-20"
      >
        <ImageOff size={18} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- miniatura já dimensionada; next/image só somaria uma transformação
    <img
      src={cover.thumbUrl}
      alt=""
      width={cover.width}
      height={cover.height}
      loading="lazy"
      decoding="async"
      style={{ backgroundColor: cover.color }}
      className="size-16 shrink-0 rounded-xl border border-white/10 object-cover sm:size-20"
    />
  );
}

function RowBody({ item }: { item: AdminItem }) {
  const photos = item.images.length;
  const results = item.images.filter((image) => image.type === "result").length;
  const meta = STATUS_META[item.status];

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.1em] ${meta.className}`}
        >
          {meta.label}
        </span>
        {item.featured && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-teal/40 bg-teal/10 px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.1em] text-teal">
            <Sparkles size={10} strokeWidth={2} aria-hidden />
            Destaque
          </span>
        )}
        {/* A galeria institucional não é um produto: ela ilustra o galpão no
            topo do /estoque e não tem página própria. Sem este aviso, seria
            fácil confundi-la com um molde à venda e apagá-la. */}
        {item.institutional && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-kraft/40 bg-kraft/10 px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.1em] text-kraft">
            <Landmark size={10} strokeWidth={2} aria-hidden />
            Galeria do acervo
          </span>
        )}
      </div>

      <p className="mt-1.5 truncate font-display text-[15px] font-medium text-white">
        {item.displayTitle}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[12px] text-white/45">
        <span className="truncate">{item.categoryLabel}</span>
        <span className="inline-flex items-center gap-1">
          <Images size={12} strokeWidth={1.75} aria-hidden />
          {photos} {photos === 1 ? "foto" : "fotos"}
          {results > 0 && ` · ${results} da peça`}
        </span>
        {photos === 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
            <ImageOff size={11} strokeWidth={1.75} aria-hidden />
            sem foto
          </span>
        )}
      </div>
    </div>
  );
}

const ICON_LINK =
  "inline-flex size-11 items-center justify-center rounded-xl border border-white/15 text-white/60 outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors hover:border-teal hover:text-teal focus-visible:ring-2";

function RowControls({
  item,
  busy,
  onStatus,
  onPreview,
  onDuplicate,
  onDelete,
  onFeatured,
}: {
  item: AdminItem;
  busy: boolean;
  onStatus: (status: StockStatus) => void;
  onPreview: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onFeatured: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={onFeatured}
        disabled={busy}
        aria-pressed={item.featured}
        aria-label={
          item.featured
            ? `Tirar ${item.displayTitle} dos destaques`
            : `Colocar ${item.displayTitle} em destaque`
        }
        title={item.featured ? "Tirar dos destaques" : "Colocar em destaque"}
        className={`hidden sm:inline-flex size-11 items-center justify-center rounded-xl border outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors focus-visible:ring-2 disabled:opacity-50 ${
          item.featured
            ? "border-teal/50 bg-teal/10 text-teal"
            : "border-white/15 text-white/45 hover:border-teal hover:text-teal"
        }`}
      >
        <Sparkles size={16} strokeWidth={1.75} aria-hidden />
      </button>

      <Link
        href={`/admin/produtos/${item.id}`}
        aria-label={`Editar ${item.displayTitle}`}
        title="Editar"
        className={ICON_LINK}
      >
        <Pencil size={16} strokeWidth={1.75} aria-hidden />
      </Link>

      {item.status === "published" && (
        <a
          // A galeria institucional não tem página própria: o link leva ao
          // catálogo, que é onde ela de fato aparece.
          href={item.institutional ? "/pt/estoque" : `/pt/estoque/${item.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver ${item.displayTitle} no site`}
          title="Ver no site"
          className={`hidden sm:inline-flex ${ICON_LINK}`}
        >
          <ExternalLink size={16} strokeWidth={1.75} aria-hidden />
        </a>
      )}

      <ActionsMenu
        label={item.displayTitle}
        busy={busy}
        actions={buildActions(item, { onStatus, onPreview, onDuplicate, onDelete })}
      />
    </div>
  );
}

function SortableRow({
  item,
  children,
}: {
  item: AdminItem;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-2xl border bg-white/[0.02] p-3 ${
        isDragging ? "z-10 border-teal shadow-[0_18px_50px_rgba(0,0,0,0.55)]" : "border-white/10"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Mover ${item.displayTitle}`}
        className="inline-flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-white/35 outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors hover:text-white focus-visible:ring-2 active:cursor-grabbing"
      >
        <GripVertical size={18} strokeWidth={1.75} aria-hidden />
      </button>
      {children}
    </li>
  );
}

export function AdminStockList({ items }: { items: AdminItem[] }) {
  const router = useRouter();
  const [order, setOrder] = useState(items);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("todas");
  const [status, setStatus] = useState<string>("ativos");
  const [reordering, setReordering] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // O servidor é a verdade: quando a página revalida, a lista local segue.
  // Ajuste durante o render (padrão do React para estado derivado de prop),
  // em vez de useEffect, que renderizaria duas vezes.
  const [syncedFrom, setSyncedFrom] = useState(items);
  if (syncedFrom !== items) {
    setSyncedFrom(items);
    setOrder(items);
  }

  const sensors = useSensors(
    // Pequeno deslocamento antes de arrastar: evita arrasto acidental num
    // toque rápido e deixa o scroll da página funcionar normalmente.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const term = normalize(query);
  const filtered = useMemo(() => {
    return order.filter((item) => {
      if (status === "ativos" ? item.status === "archived" : status !== "todos" && item.status !== status) {
        return false;
      }
      if (category !== "todas" && item.categoryKey !== category) return false;
      if (term === "") return true;
      return normalize(
        `${item.displayTitle} ${item.slug} ${item.categoryLabel} ${item.segmentLabel}`
      ).includes(term);
    });
  }, [order, term, category, status]);

  const visibleProducts = filtered.filter((item) => !item.institutional).length;
  const visibleGalleries = filtered.length - visibleProducts;

  const filtering = term !== "" || category !== "todas" || status !== "ativos";
  // Arrastar com a lista filtrada gravaria uma ordem que o dono não vê
  // inteira. O modo manual só liga com a lista completa à vista.
  const canDrag = reordering && !filtering;

  function run(id: string, action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusyId(id);
    setError(null);
    startTransition(async () => {
      const result = await action();
      setBusyId(null);
      if (!result.ok && result.error) setError(result.error);
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = order.findIndex((item) => item.id === active.id);
    const to = order.findIndex((item) => item.id === over.id);
    if (from === -1 || to === -1) return;

    const previous = order;
    const next = arrayMove(order, from, to);
    setOrder(next); // otimista: o card fica onde o dedo soltou
    setSavingOrder(true);
    setError(null);

    const result = await reorderItems(next.map((item) => item.id));
    setSavingOrder(false);
    if (!result.ok) {
      setError(`Não foi possível salvar a ordem: ${result.error}`);
      setOrder(previous);
    }
  }

  function handleDelete(item: AdminItem) {
    const confirmed = window.confirm(
      `Excluir "${item.displayTitle}" definitivamente?\n\n` +
        "As fotos enviadas pelo painel também serão apagadas e não há como desfazer.\n\n" +
        "Se a ideia é só tirar do site, use Arquivar — isso pode ser revertido."
    );
    if (!confirmed) return;
    run(item.id, () => deleteItem(item.id));
  }

  const handlers = (item: AdminItem) => ({
    onStatus: (next: StockStatus) => run(item.id, () => setItemStatus(item.id, next)),
    onPreview: () => router.push(`/admin/produtos/${item.id}/preview`),
    onDuplicate: () => run(item.id, () => duplicateItem(item.id)),
    onDelete: () => handleDelete(item),
    onFeatured: () => run(item.id, () => setItemFeatured(item.id, !item.featured)),
  });

  const usedCategories = useMemo(() => {
    const present = new Set(order.map((item) => item.categoryKey));
    return CATEGORY_ORDER.filter((key) => present.has(key));
  }, [order]);

  return (
    <div className="space-y-5">
      {/* ── busca e filtros ── */}
      <div className="flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Buscar produto no estoque</span>
          <Search
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, categoria…"
            enterKeyHint="search"
            className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] pl-11 pr-11 font-body text-base text-white outline-none transition-colors placeholder:text-white/30 focus:border-teal focus-visible:ring-1 focus-visible:ring-teal sm:text-[15px]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={15} strokeWidth={1.75} />
            </button>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filtrar por status"
            className="min-h-11 rounded-xl border border-white/15 bg-white/[0.04] px-3 font-body text-[14px] text-white outline-none transition-colors focus:border-teal"
          >
            <option value="ativos">Todos (sem arquivados)</option>
            <option value="todos">Incluir arquivados</option>
            {STOCK_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_META[value].label}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filtrar por categoria"
            className="min-h-11 rounded-xl border border-white/15 bg-white/[0.04] px-3 font-body text-[14px] text-white outline-none transition-colors focus:border-teal"
          >
            <option value="todas">Todas as categorias</option>
            {usedCategories.map((key) => (
              <option key={key} value={key}>
                {dict.stock.categories[key]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setReordering((value) => !value)}
            aria-pressed={reordering}
            className={ghostButtonClass(
              reordering ? "border-teal bg-teal/10 text-teal" : undefined
            )}
          >
            <ArrowUpDown size={15} strokeWidth={1.75} aria-hidden />
            {reordering ? "Sair da reordenação" : "Reordenar catálogo"}
          </button>

          {savingOrder && (
            <span role="status" className="inline-flex items-center gap-1.5 font-body text-[13px] text-white/45">
              <Loader2 size={14} strokeWidth={1.75} className="animate-spin" aria-hidden />
              Salvando ordem…
            </span>
          )}
        </div>
      </div>

      {reordering && filtering && (
        <p className="rounded-xl border border-amber-400/35 bg-amber-400/[0.07] px-4 py-3 font-body text-[13px] leading-relaxed text-amber-100">
          Para arrastar, limpe a busca e os filtros. Com a lista filtrada, a nova ordem
          valeria só para o que está à vista — e não é isso que iria para o site.
        </p>
      )}

      {error && <ErrorBox>{error}</ErrorBox>}

      <p aria-live="polite" className="font-body text-[13px] text-white/40">
        {filtered.length === 0
          ? "Nenhum produto encontrado com esses filtros."
          : // A galeria do acervo é contada à parte para este número bater com
            // o cartão "Produtos cadastrados" lá em cima.
            `${visibleProducts} ${visibleProducts === 1 ? "produto" : "produtos"}${
              visibleGalleries > 0 ? ` · ${visibleGalleries} galeria do acervo` : ""
            }${filtering ? ` — de ${order.filter((item) => !item.institutional).length}` : ""}`}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center">
          <p className="font-display text-lg font-medium text-white">
            {order.length === 0 ? "Nenhum produto cadastrado ainda" : "Nada encontrado"}
          </p>
          <p className="mx-auto mt-3 max-w-sm font-body text-[14px] leading-relaxed text-white/50">
            {order.length === 0
              ? "Clique em “Adicionar novo produto” para cadastrar o primeiro molde."
              : "Tente outro termo ou limpe os filtros."}
          </p>
        </div>
      ) : canDrag ? (
        <>
          <p className="font-body text-[13px] text-white/45">
            Arraste pela alça para mudar a ordem. É exatamente a ordem que aparece no site.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={order.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2.5">
                {order.map((item) => (
                  <SortableRow key={item.id} item={item}>
                    <Thumb item={item} />
                    <RowBody item={item} />
                    <RowControls item={item} busy={busyId === item.id} {...handlers(item)} />
                  </SortableRow>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 ${
                item.status === "archived" ? "opacity-55" : ""
              }`}
            >
              <Thumb item={item} />
              <RowBody item={item} />
              <RowControls item={item} busy={busyId === item.id} {...handlers(item)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
