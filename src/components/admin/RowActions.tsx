"use client";

import { useEffect, useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";
import type { StockStatus } from "@/lib/stock/types";
import type { AdminItem } from "@/lib/admin/types";

export interface RowAction {
  label: string;
  icon: React.ReactNode;
  run: () => void;
  danger?: boolean;
}

/**
 * Ações disponíveis para um item, em função do status atual.
 *
 * Só aparece o que faz sentido agora: um produto já publicado não oferece
 * "Publicar", e um vendido oferece "Reativar". Arquivar vem antes de excluir
 * porque arquivar é reversível — a preferência é sempre essa.
 */
export function buildActions(
  item: AdminItem,
  handlers: {
    onStatus: (status: StockStatus) => void;
    onPreview: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
  }
): RowAction[] {
  const actions: RowAction[] = [];
  const icon = (node: React.ReactNode) => node;

  if (item.status !== "published") {
    actions.push({
      label: "Publicar no site",
      icon: icon(<Send size={15} strokeWidth={1.75} aria-hidden />),
      run: () => handlers.onStatus("published"),
    });
  }

  if (item.status === "published") {
    actions.push({
      label: "Ocultar do site",
      icon: icon(<EyeOff size={15} strokeWidth={1.75} aria-hidden />),
      run: () => handlers.onStatus("hidden"),
    });
  }

  if (item.status === "sold") {
    actions.push({
      label: "Reativar",
      icon: icon(<RotateCcw size={15} strokeWidth={1.75} aria-hidden />),
      run: () => handlers.onStatus("published"),
    });
  } else if (item.status !== "archived") {
    actions.push({
      label: "Marcar como vendido",
      icon: icon(<CheckCircle2 size={15} strokeWidth={1.75} aria-hidden />),
      run: () => handlers.onStatus("sold"),
    });
  }

  actions.push({
    label: "Pré-visualizar",
    icon: icon(<Eye size={15} strokeWidth={1.75} aria-hidden />),
    run: handlers.onPreview,
  });

  actions.push({
    label: "Duplicar",
    icon: icon(<Copy size={15} strokeWidth={1.75} aria-hidden />),
    run: handlers.onDuplicate,
  });

  actions.push(
    item.status === "archived"
      ? {
          label: "Restaurar como rascunho",
          icon: icon(<ArchiveRestore size={15} strokeWidth={1.75} aria-hidden />),
          run: () => handlers.onStatus("draft"),
        }
      : {
          label: "Arquivar",
          icon: icon(<Archive size={15} strokeWidth={1.75} aria-hidden />),
          run: () => handlers.onStatus("archived"),
        }
  );

  actions.push({
    label: "Excluir definitivamente",
    icon: icon(<Trash2 size={15} strokeWidth={1.75} aria-hidden />),
    run: handlers.onDelete,
    danger: true,
  });

  return actions;
}

/** Menu de ações da linha. Fecha no Esc, no clique fora e ao escolher. */
export function ActionsMenu({
  actions,
  label,
  busy,
}: {
  actions: RowAction[];
  label: string;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={busy}
        aria-label={`Mais ações para ${label}`}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex size-11 items-center justify-center rounded-xl border border-white/15 text-white/60 outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors hover:border-teal hover:text-teal focus-visible:ring-2 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 size={16} strokeWidth={1.75} className="animate-spin" aria-hidden />
        ) : (
          <MoreHorizontal size={17} strokeWidth={1.75} aria-hidden />
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`Ações para ${label}`}
          className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-white/15 bg-navy shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                action.run();
              }}
              className={`flex w-full min-h-11 items-center gap-3 px-4 py-2.5 text-left font-body text-[14px] outline-none transition-colors focus-visible:bg-white/10 ${
                action.danger
                  ? "text-red-300 hover:bg-red-500/15"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span aria-hidden className="shrink-0">
                {action.icon}
              </span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
