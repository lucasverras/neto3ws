import Link from "next/link";

/** Moldura das telas sem sessão: entrar, recuperar e definir nova senha. */
export function AdminAuthShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-5 py-14">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-display text-2xl font-medium tracking-tight text-white">
            3WS Moldes
          </p>
          <h1 className="mt-2 font-body text-[11px] uppercase tracking-[0.24em] text-white/40">
            {subtitle}
          </h1>
        </div>

        {children}
      </div>

      <Link
        href="/pt"
        className="mt-12 font-body text-[13px] text-white/35 transition-colors hover:text-white/70"
      >
        Voltar para o site
      </Link>
    </main>
  );
}
