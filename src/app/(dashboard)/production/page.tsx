import { EmptyState } from "@/components/feedback/empty-state";
import { ProductionForm } from "@/components/forms/production-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getProducts, getProductionOrders, getProfileData, getRecipes } from "@/server/queries/catalog";

export default async function ProductionPage() {
  const [profile, products, recipes, productionOrders] = await Promise.all([getProfileData(), getProducts(), getRecipes(), getProductionOrders()]);

  if (profile?.business_type === "reseller") {
    return (
      <>
        <PageHeader eyebrow="Operaciones" title="Produccion" description="La produccion solo aplica a cuentas que fabrican productos." />
        <EmptyState title="Modulo no requerido para reventa" description="Las cuentas de reventa no necesitan registrar produccion." />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Modulo 3"
        title="Produccion"
        description="Registra cada lote producido para descontar insumos, calcular costo y sumar stock terminado en una sola confirmacion."
      />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nueva produccion</h3>
        <p className="mt-1 text-sm text-autora-ink/70">Al confirmar, AUTORA descuenta insumos, calcula costo historico y aumenta stock de producto terminado.</p>
        <div className="mt-4">
          {products.filter((product) => product.product_type === "manufactured").length > 0 && recipes.length > 0 ? (
            <ProductionForm products={products} recipes={recipes} />
          ) : (
            <p className="text-sm text-amber-700">Necesitas productos fabricados y recetas activas para registrar produccion.</p>
          )}
        </div>
      </Card>
      {productionOrders.length > 0 ? (
        <div className="grid gap-4">
          {productionOrders.map((order) => (
            <Card key={order.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {order.products?.name ?? "Producto"} - {order.date}
                  </h3>
                  <p className="text-sm text-autora-ink/70">
                    Receta: {order.recipes?.name ?? "Sin receta"} · {order.notes || "Sin observaciones."}
                  </p>
                </div>
                <div className="grid gap-3 text-right sm:grid-cols-3 sm:text-left lg:text-right">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-autora-sage">Producido</p>
                    <p className="mt-1 text-2xl font-semibold">{Number(order.quantity_produced).toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-autora-sage">Costo total</p>
                    <p className="mt-1 text-lg font-semibold">{order.total_cost !== null ? Number(order.total_cost).toFixed(2) : "Pendiente"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-autora-sage">Costo unitario</p>
                    <p className="mt-1 text-lg font-semibold">{order.unit_cost !== null ? Number(order.unit_cost).toFixed(2) : "Pendiente"}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Todavia no hay producciones" description="Las producciones que registres apareceran aqui junto con su impacto en inventario y costos." />
      )}
    </>
  );
}
