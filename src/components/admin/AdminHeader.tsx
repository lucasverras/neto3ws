import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/lib/admin/authActions";
import { TAP } from "./ui";

const ICON_BUTTON =
  "inline-flex size-11 items-center justify-center rounded-xl border border-white/15 text-white/60 outline-none ring-teal ring-offset-2 ring-offset-ink transition-colors hover:border-teal hover:text-teal focus-visible:ring-2";

export function AdminHeader({ email }: { email: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
      <div className="min-w-0">
        <Link
          href="/admin"
          className="font-display text-xl font-medium tracking-tight text-white outline-none ring-teal ring-offset-4 ring-offset-ink focus-visible:ring-2"
        >
          3WS Moldes
        </Link>
        <p className="mt-1 truncate font-body text-[11px] uppercase tracking-[0.2em] text-white/35">
          Painel do estoque · {email}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/pt/estoque"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir o estoque no site"
          title="Abrir o estoque no site"
          className={ICON_BUTTON}
        >
          <ExternalLink size={17} strokeWidth={1.75} aria-hidden />
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sair do painel"
            title="Sair do painel"
            className={`${ICON_BUTTON} ${TAP} hover:border-red-400/60 hover:text-red-300`}
          >
            <LogOut size={17} strokeWidth={1.75} aria-hidden />
          </button>
        </form>
      </div>
    </header>
  );
}
