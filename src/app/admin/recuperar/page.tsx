import type { Metadata } from "next";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { RequestResetForm } from "@/components/admin/ResetForms";

export const metadata: Metadata = {
  title: "Recuperar senha | Painel 3WS",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function RecuperarPage() {
  return (
    <AdminAuthShell subtitle="Recuperar acesso">
      <RequestResetForm />
    </AdminAuthShell>
  );
}
