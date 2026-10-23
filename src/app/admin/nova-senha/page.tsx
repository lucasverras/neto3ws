import type { Metadata } from "next";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { NewPasswordForm } from "@/components/admin/ResetForms";

export const metadata: Metadata = {
  title: "Nova senha | Painel 3WS",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * Destino do link enviado por e-mail. O Supabase cria a sessão de recuperação
 * ao abrir esta página; sem ela, `updatePassword` recusa e pede um link novo.
 */
export default function NovaSenhaPage() {
  return (
    <AdminAuthShell subtitle="Definir nova senha">
      <NewPasswordForm />
    </AdminAuthShell>
  );
}
