import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { PurchaseForm } from "@/components/forms/purchase-form";
import { PageHeader } from "@/components/layout/page-header";
import { getPurchases, getResources } from "@/server/queries/catalog";

export default async function PurchasesPage() {
  const [resources, purchases] = await Promise.all([getResources(), getPurchases()]);

  return (
    <>
      <PageHeader eyebrow="Módulo 2" title="Compras" description="Registra compras de recursos para actualizar el stock automáticamente." />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nueva compra</h3>
        <p className="mt-1 text-sm text-autora-ink/70">Cada compra aumenta el stock del recurso seleccionado.</p>
        <div className="mt-4">
          {resources.length > 0 ? <PurchaseForm resources={resources} /> : <p className="text-sm text-amber-700">Primero necesitas cargar un recurso para poder registrar compras.</p>}
        </div>
      </Card>
      {purchases.length > 0 ? (
        <div className="grid gap-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Compra del {purchase.date}</h3>
                  <p className="text-sm text-autora-ink/70">{purchase.notes || "Sin observaciones."}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-autora-sage">Recurso</p>
                  <p className="mt-1 text-2xl font-semibold">{Number(purchase.total).toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="Todavía no hay compras" description="Las compras que registres aparecerán aquí y aumentarán el stock automáticamente." />}
    </>
  );
}
