import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";

export const metadata: Metadata = {
  title: "Entrar | Painel 3WS",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; next?: string }>;
}) {
  const { erro, next } = await searchParams;
  // Só caminhos internos do painel voltam no destino pós-login.
  const target = next?.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";

  return (
    <AdminAuthShell subtitle="Painel do estoque">
      {erro === "config" && (
        <p
          role="alert"
          className="mt-8 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 font-body text-[14px] leading-relaxed text-amber-100"
        >
          O painel ainda não está conectado ao banco neste ambiente. Preencha{" "}
          <code className="font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
          <code className="font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> e
          refaça o deploy.
        </p>
      )}

      <LoginForm next={target} />
    </AdminAuthShell>
  );
}
