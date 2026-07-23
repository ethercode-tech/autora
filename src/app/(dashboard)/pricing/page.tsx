import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { PricingForm } from "@/components/forms/pricing-form";
import { PageHeader } from "@/components/layout/page-header";
import { getPricingHistory, getProducts, getResources } from "@/server/queries/catalog";

export default async function PricingPage() {
  const [products, resources, pricingHistory] = await Promise.all([getProducts(), getResources(), getPricingHistory()]);

  return (
    <>
      <PageHeader eyebrow="Modulo 4" title="Precio" description="Calcula costo, ganancia y precio sugerido usando los recursos que indiques." />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nuevo calculo</h3>
        <p className="mt-1 text-sm text-autora-ink/70">Cada recurso usado debe tener una compra registrada para obtener su costo real.</p>
        <div className="mt-4">
          {products.length > 0 && resources.length > 0 ? <PricingForm products={products} resources={resources} /> : <p className="text-sm text-amber-700">Necesitas al menos un producto y un recurso para usar la calculadora.</p>}
        </div>
      </Card>
      {pricingHistory.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {pricingHistory.map((item) => (
            <Card key={item.id}>
              <h3 className="text-lg font-semibold">{item.products?.name ?? "Producto"}</h3>
              <p className="mt-1 text-sm text-autora-ink/70">{item.created_at}</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <div><dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Costo</dt><dd className="mt-1 text-sm">{Number(item.total_cost).toFixed(2)}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Ganancia</dt><dd className="mt-1 text-sm">{Number(item.profit_percentage).toFixed(2)}%</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Sugerido</dt><dd className="mt-1 text-sm">{Number(item.suggested_price).toFixed(2)}</dd></div>
              </dl>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="Todavia no hay calculos guardados" description="El historial aparecera aqui cada vez que guardes un calculo." />}
    </>
  );
}
