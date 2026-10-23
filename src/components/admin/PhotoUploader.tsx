"use client";

import { useRef, useState } from "react";
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
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeftRight,
  GripVertical,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Undo2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STOCK_BUCKET } from "@/lib/supabase/env";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGES_PER_ITEM,
  MAX_IMAGE_BYTES,
} from "@/lib/admin/constants";
import { processImage } from "@/lib/admin/imageProcessing";
import type { ImageInput } from "@/lib/admin/mutations";
import type { StockImageType } from "@/lib/stock/types";
import { ErrorBox } from "./ui";

/** Foto na tela: o que vai para o banco + o necessário para exibi-la. */
export interface PhotoDraft extends ImageInput {
  /** Enviada agora e ainda não salva — pode virar lixo se o dono desistir. */
  isNew: boolean;
  /** URL já resolvida da miniatura. O banco guarda referências, não URLs. */
  previewUrl: string;
}

interface PendingFile {
  key: string;
  name: string;
  /** 0–100. Reflete variantes já enviadas, não bytes — é o que dá para medir. */
  progress: number;
  error: string | null;
}

const SECTION_COPY: Record<
  StockImageType,
  { title: string; hint: string; empty: string; moveTo: string }
> = {
  mold: {
    title: "Fotos do molde",
    hint: "O ferramental em si: vistas gerais, detalhes, gravações e identificação.",
    empty: "Arraste suas fotos aqui ou clique para selecionar",
    moveTo: "Mover para “peça produzida”",
  },
  result: {
    title: "Fotos da peça produzida",
    hint: "A peça que este molde fabrica. Essas fotos ganham uma galeria própria na página do molde.",
    empty: "Arraste aqui as fotos da peça que o molde produz",
    moveTo: "Mover para “fotos do molde”",
  },
};

function SortablePhoto({
  photo,
  index,
  isCover,
  onRemove,
  onSetCover,
  onMove,
  disabled,
}: {
  photo: PhotoDraft;
  index: number;
  isCover: boolean;
  onRemove: () => void;
  onSetCover: () => void;
  onMove: () => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  const copy = SECTION_COPY[photo.type];

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`overflow-hidden rounded-xl border bg-white/[0.02] ${
        isDragging ? "z-10 border-teal shadow-[0_18px_50px_rgba(0,0,0,0.55)]" : "border-white/10"
      }`}
    >
      <div className="relative aspect-4/3 bg-navy-soft">
        {/* eslint-disable-next-line @next/next/no-img-element -- miniatura já dimensionada */}
        <img
          src={photo.previewUrl}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ backgroundColor: photo.color }}
          className="h-full w-full object-cover"
        />

        {isCover && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-teal px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.1em] text-white">
            <Star size={10} strokeWidth={2.5} aria-hidden />
            Capa
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-0.5 border-t border-white/10 px-1 py-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Mover foto ${index + 1} de posição`}
          title="Arrastar para reordenar"
          className="inline-flex size-11 cursor-grab touch-none items-center justify-center rounded-lg text-white/35 outline-none ring-teal transition-colors hover:text-white focus-visible:ring-2 active:cursor-grabbing"
        >
          <GripVertical size={16} strokeWidth={1.75} aria-hidden />
        </button>

        <button
          type="button"
          onClick={onSetCover}
          disabled={disabled || isCover}
          aria-label={`Usar foto ${index + 1} como capa`}
          title={isCover ? "Já é a capa" : "Usar como capa"}
          className={`inline-flex size-11 items-center justify-center rounded-lg outline-none ring-teal transition-colors focus-visible:ring-2 disabled:opacity-40 ${
            isCover ? "text-teal" : "text-white/35 hover:text-teal"
          }`}
        >
          <Star size={16} strokeWidth={1.75} aria-hidden />
        </button>

        <button
          type="button"
          onClick={onMove}
          disabled={disabled}
          aria-label={`${copy.moveTo} — foto ${index + 1}`}
          title={copy.moveTo}
          className="inline-flex size-11 items-center justify-center rounded-lg text-white/35 outline-none ring-teal transition-colors hover:text-teal focus-visible:ring-2 disabled:opacity-40"
        >
          <ArrowLeftRight size={16} strokeWidth={1.75} aria-hidden />
        </button>

        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remover foto ${index + 1}`}
          title="Remover"
          className="inline-flex size-11 items-center justify-center rounded-lg text-white/35 outline-none ring-teal transition-colors hover:text-red-300 focus-visible:ring-2 disabled:opacity-40"
        >
          <Trash2 size={16} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </li>
  );
}

export function PhotoUploader({
  itemId,
  type,
  photos,
  allPhotos,
  coverId,
  onChange,
  onSetCover,
  onMove,
  onTrackOrphan,
}: {
  itemId: string;
  type: StockImageType;
  /** Fotos desta seção, já na ordem. */
  photos: PhotoDraft[];
  /** Total do produto — usado só para respeitar o limite global. */
  allPhotos: PhotoDraft[];
  coverId: string | null;
  onChange: (next: PhotoDraft[]) => void;
  onSetCover: (id: string) => void;
  onMove: (id: string) => void;
  /** Arquivo enviado que saiu da lista: será apagado do bucket ao salvar. */
  onTrackOrphan: (refs: string[]) => void;
}) {
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ photo: PhotoDraft; index: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Contador em vez de booleano: `dragleave` dispara ao passar por elementos
  // filhos, e sem isso a borda piscaria com o arquivo em cima.
  const dragDepth = useRef(0);

  const copy = SECTION_COPY[type];
  const uploading = pending.some((file) => file.error === null);
  const remaining = MAX_IMAGES_PER_ITEM - allPhotos.length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /** Descarta definitivamente o que estava no slot de desfazer. */
  function commitUndo(slot: { photo: PhotoDraft } | null) {
    if (slot?.photo.isNew) {
      onTrackOrphan(slot.photo.variants.map((variant) => variant.ref));
    }
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);
    if (files.length > remaining) {
      setError(
        `Cabem mais ${remaining} foto${remaining === 1 ? "" : "s"} neste produto (limite de ${MAX_IMAGES_PER_ITEM}).`
      );
      return;
    }

    for (const file of files) {
      if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        setError(`"${file.name}" não é JPEG, PNG ou WebP.`);
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(
          `"${file.name}" tem mais de ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB. Reduza a foto e tente de novo.`
        );
        return;
      }
    }

    const queued: PendingFile[] = files.map((file, index) => ({
      key: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      progress: 0,
      error: null,
    }));
    setPending((current) => [...current, ...queued]);

    const supabase = createClient();
    const uploaded: PhotoDraft[] = [];

    for (const [index, file] of files.entries()) {
      const tracker = queued[index];
      const update = (patch: Partial<PendingFile>) =>
        setPending((current) =>
          current.map((entry) => (entry.key === tracker.key ? { ...entry, ...patch } : entry))
        );

      try {
        const processed = await processImage(file);
        update({ progress: 15 });

        const photoId = crypto.randomUUID();
        const variants: { w: number; ref: string }[] = [];

        for (const [step, variant] of processed.variants.entries()) {
          const ref = `${itemId}/${photoId}-${variant.width}.webp`;
          const { error: uploadError } = await supabase.storage
            .from(STOCK_BUCKET)
            .upload(ref, variant.blob, {
              cacheControl: "31536000",
              contentType: "image/webp",
              upsert: false,
            });

          if (uploadError) throw new Error(uploadError.message);

          variants.push({ w: variant.width, ref });
          update({ progress: 15 + Math.round(((step + 1) / processed.variants.length) * 85) });
        }

        const { data } = supabase.storage
          .from(STOCK_BUCKET)
          .getPublicUrl(variants[variants.length - 1].ref);

        uploaded.push({
          id: photoId,
          type,
          source: "storage",
          variants,
          width: processed.width,
          height: processed.height,
          color: processed.color,
          isCover: false,
          fileName: file.name.replace(/\.[^.]+$/, "").slice(0, 120),
          alt: {},
          isNew: true,
          previewUrl: data.publicUrl,
        });

        setPending((current) => current.filter((entry) => entry.key !== tracker.key));
      } catch (cause) {
        update({
          error: cause instanceof Error ? cause.message : "Falha ao enviar.",
        });
      }
    }

    if (uploaded.length > 0) onChange([...photos, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(photo: PhotoDraft, index: number) {
    commitUndo(undo);
    setUndo({ photo, index });
    onChange(photos.filter((entry) => entry.id !== photo.id));
  }

  function handleUndo() {
    if (!undo) return;
    const next = [...photos];
    next.splice(Math.min(undo.index, next.length), 0, undo.photo);
    onChange(next);
    setUndo(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = photos.findIndex((photo) => photo.id === active.id);
    const to = photos.findIndex((photo) => photo.id === over.id);
    if (from === -1 || to === -1) return;
    onChange(arrayMove(photos, from, to));
  }

  // ── arrastar arquivos do computador para dentro da área ──
  function onDragEnter(event: React.DragEvent) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }
  function onDragOver(event: React.DragEvent) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }
  function onDragLeave() {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }
  function onDrop(event: React.DragEvent) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <section
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      aria-labelledby={`fotos-${type}`}
      className={`relative rounded-2xl border p-5 transition-colors md:p-6 ${
        dragging ? "border-teal bg-teal/[0.06]" : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <h3
        id={`fotos-${type}`}
        className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-white/55"
      >
        {copy.title}
      </h3>
      <p className="mt-2 max-w-xl font-body text-[13px] leading-relaxed text-white/40">
        {copy.hint}
      </p>

      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-ink/85">
          <p className="inline-flex items-center gap-2 font-body text-[15px] font-medium text-teal">
            <ImagePlus size={18} strokeWidth={1.75} aria-hidden />
            Solte as fotos aqui
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={photos.map((photo) => photo.id)} strategy={rectSortingStrategy}>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo, index) => (
                <SortablePhoto
                  key={photo.id}
                  photo={photo}
                  index={index}
                  isCover={photo.id === coverId}
                  disabled={uploading}
                  onRemove={() => handleRemove(photo, index)}
                  onSetCover={() => onSetCover(photo.id)}
                  onMove={() => onMove(photo.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {pending.length > 0 && (
        <ul className="mt-4 space-y-2">
          {pending.map((file) => (
            <li
              key={file.key}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
            >
              {file.error ? (
                <span className="font-body text-[12px] text-red-300">falhou</span>
              ) : (
                <Loader2
                  size={14}
                  strokeWidth={1.75}
                  className="shrink-0 animate-spin text-teal"
                  aria-hidden
                />
              )}
              <span className="min-w-0 flex-1 truncate font-body text-[13px] text-white/65">
                {file.name}
              </span>
              {file.error ? (
                <span className="font-body text-[12px] text-red-300">{file.error}</span>
              ) : (
                <span
                  role="progressbar"
                  aria-valuenow={file.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Enviando ${file.name}`}
                  className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-white/10"
                >
                  <span
                    style={{ width: `${file.progress}%` }}
                    className="block h-full rounded-full bg-teal transition-[width] duration-300"
                  />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {undo && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3">
          <p className="font-body text-[13px] text-white/60">
            Foto removida. Ela só sai de vez quando você salvar.
          </p>
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/20 px-3 font-body text-[13px] text-white outline-none ring-teal transition-colors hover:border-teal hover:text-teal focus-visible:ring-2"
          >
            <Undo2 size={14} strokeWidth={1.75} aria-hidden />
            Desfazer
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || remaining <= 0}
        className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 font-body text-[14px] text-white/65 outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors hover:border-teal hover:text-teal focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 size={16} strokeWidth={1.75} className="animate-spin" aria-hidden />
            Enviando fotos…
          </>
        ) : (
          <>
            <ImagePlus size={16} strokeWidth={1.75} aria-hidden />
            {remaining > 0 ? copy.empty : `Limite de ${MAX_IMAGES_PER_ITEM} fotos atingido`}
          </>
        )}
      </button>

      {error && <div className="mt-4">
        <ErrorBox>{error}</ErrorBox>
      </div>}
    </section>
  );
}
