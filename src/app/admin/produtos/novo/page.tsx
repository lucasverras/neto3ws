import { redirect } from "next/navigation";
import { StockItemForm } from "@/components/admin/StockItemForm";
import { getAdminUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function NovoProdutoPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?next=/admin/produtos/novo");

  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8 sm:py-10">
      <StockItemForm />
    </div>
  );
}
