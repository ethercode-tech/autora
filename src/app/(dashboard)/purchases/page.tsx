import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { PurchaseForm } from "@/components/forms/purchase-form";
import { PageHeader } from "@/components/layout/page-header";
import { getProducts, getProfileData, getPurchases, getResources } from "@/server/queries/catalog";

export default async function PurchasesPage() {
  const [profile, resources, products, purchases] = await Promise.all([getProfileData(), getResources(), getProducts(), getPurchases()]);
  const sourceItems = profile?.business_type === "reseller" ? products : resources;

  return (
    <>
      <PageHeader
        eyebrow="Modulo 2"
        title="Compras"
        description="Registra cada compra para que el stock aumente y el egreso economico quede guardado en la misma operacion."
      />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nueva compra</h3>
        <p className="mt-1 text-sm text-autora-ink/70">
          {profile?.business_type === "reseller"
            ? "Para cuentas de reventa, las compras ingresan stock de productos."
            : "Para cuentas de fabricación, las compras ingresan stock de recursos."}
        </p>
        <div className="mt-4">
          {sourceItems.length > 0 ? (
            <PurchaseForm products={products} profile={profile} resources={resources} />
          ) : (
            <p className="text-sm text-amber-700">Primero necesitas cargar items en el catálogo para poder registrar compras.</p>
          )}
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
                  <p className="text-xs uppercase tracking-[0.2em] text-autora-sage">{purchase.purchase_type === "product" ? "Reventa" : "Recurso"}</p>
                  <p className="mt-1 text-2xl font-semibold">{Number(purchase.total).toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Todavia no hay compras" description="Las compras que registres aparecerán aquí con impacto automático sobre stock y finanzas." />
      )}
    </>
  );
}
