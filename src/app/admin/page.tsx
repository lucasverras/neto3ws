import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStockList } from "@/components/admin/AdminStockList";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { primaryButtonClass } from "@/components/admin/ui";
import { getAdminUser } from "@/lib/admin/auth";
import { buildStats, getAdminCatalog } from "@/lib/admin/queries";

// O painel mostra rascunhos e itens ocultos: nada aqui pode ser cacheado.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // O proxy já barrou quem não tem sessão; esta é a checagem que vale,
  // porque confere o UUID na tabela de administradores.
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?next=/admin");

  const { items, error } = await getAdminCatalog();
  const stats = buildStats(items);

  return (
    <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-10">
      <AdminHeader email={admin.email} />

      <div className="mt-8 flex flex-col gap-6">
        <Link href="/admin/produtos/novo" className={primaryButtonClass("w-full sm:w-auto sm:self-start")}>
          <Plus size={17} strokeWidth={2} aria-hidden />
          Adicionar novo produto
        </Link>

        {error ? (
          /* Erro NÃO é estoque vazio — o dono precisa saber a diferença. */
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-8">
            <p className="font-display text-lg font-medium text-red-200">
              Não foi possível carregar o estoque.
            </p>
            <p className="mt-3 font-body text-[14px] leading-relaxed text-red-200/75">
              Nada foi perdido: o catálogo continua no banco. Confira a configuração do
              Supabase e recarregue a página.
            </p>
            <p className="mt-4 font-mono text-[12px] break-words text-red-200/60">{error}</p>
          </div>
        ) : (
          <>
            <DashboardStats stats={stats} />
            <AdminStockList items={items} />
          </>
        )}
      </div>
    </div>
  );
}
