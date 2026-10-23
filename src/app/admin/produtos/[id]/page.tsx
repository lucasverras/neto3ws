import { notFound, redirect } from "next/navigation";
import { StockItemForm } from "@/components/admin/StockItemForm";
import { getAdminUser } from "@/lib/admin/auth";
import { getAdminItem, getItemHistory } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const admin = await getAdminUser();
  if (!admin) redirect(`/admin/login?next=/admin/produtos/${id}`);

  const item = await getAdminItem(id);
  if (!item) notFound();

  const history = await getItemHistory(id);

  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8 sm:py-10">
      <StockItemForm item={item} history={history} />
    </div>
  );
}
