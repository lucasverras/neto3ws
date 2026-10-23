/**
 * Peças visuais compartilhadas do painel.
 *
 * Mesmo vocabulário do site — fundo ink, cartões discretos sobre branco a 2%,
 * acento teal, Satoshi — mas com alvos de toque maiores: o Neto cadastra
 * molde pelo celular, de pé no galpão.
 */

import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/admin/constants";
import type { StockStatus } from "@/lib/stock/types";

/** Altura mínima de 44 px em tudo que é clicável — alvo confortável no toque. */
export const TAP = "min-h-11";

export const FIELD_CLASS =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 font-body text-base text-white outline-none transition-colors placeholder:text-white/30 hover:border-white/25 focus:border-teal focus-visible:ring-1 focus-visible:ring-teal sm:text-[15px]";

export const LABEL_CLASS =
  "mb-2 block font-body text-[11px] font-medium uppercase tracking-[0.16em] text-white/45";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: StockStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.12em]",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}

export function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-[14px] leading-relaxed text-red-200"
    >
      {children}
    </p>
  );
}

export function SuccessBox({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-xl border border-teal/40 bg-teal/10 px-4 py-3 font-body text-[14px] leading-relaxed text-teal"
    >
      {children}
    </p>
  );
}

/** Botão primário do painel — o mesmo teal dos CTAs do site. */
export function primaryButtonClass(extra?: string) {
  return cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal px-6 font-body text-[14px] font-medium text-white outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors hover:bg-teal-deep focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-55",
    extra
  );
}

export function ghostButtonClass(extra?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 font-body text-[14px] text-white/75 outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors hover:border-white/35 hover:text-white focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-55",
    extra
  );
}
