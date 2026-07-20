import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { PricingForm } from "@/components/forms/pricing-form";
import { PageHeader } from "@/components/layout/page-header";
import { getPricingHistory, getProducts, getProfileData, getRecipes } from "@/server/queries/catalog";

export default async function PricingPage() {
  const [profile, products, recipes, pricingHistory] = await Promise.all([
    getProfileData(),
    getProducts(),
    getRecipes(),
    getPricingHistory()
  ]);

  if (profile?.business_type === "reseller") {
    return (
      <>
        <PageHeader eyebrow="Herramientas" title="Calculadora de costos" description="La calculadora por receta solo aplica a productos fabricados." />
        <EmptyState title="Modulo no requerido para reventa" description="Las cuentas de reventa no calculan costos a partir de recetas de producción." />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Herramientas"
        title="Calculadora de costos"
        description="Calcula costo unitario, recargo y precio sugerido a partir de recetas y costos vigentes de compra."
      />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nuevo calculo</h3>
        <p className="mt-1 text-sm text-autora-ink/70">Esta version guarda en historial el costo unitario y el precio sugerido calculado sobre costo.</p>
        <div className="mt-4">
          {products.filter((product) => product.product_type === "manufactured").length > 0 && recipes.length > 0 ? (
            <PricingForm products={products} recipes={recipes} />
          ) : (
            <p className="text-sm text-amber-700">Necesitas productos fabricados y recetas para usar la calculadora.</p>
          )}
        </div>
      </Card>
      {pricingHistory.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {pricingHistory.map((item) => (
            <Card key={item.id}>
              <h3 className="text-lg font-semibold">{item.product_name_snapshot}</h3>
              <p className="mt-1 text-sm text-autora-ink/70">{item.created_at}</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Costo</dt>
                  <dd className="mt-1 text-sm">{Number(item.cost).toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Recargo</dt>
                  <dd className="mt-1 text-sm">{Number(item.profit_percentage).toFixed(2)}%</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Sugerido</dt>
                  <dd className="mt-1 text-sm">{Number(item.suggested_price).toFixed(2)}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Todavia no hay calculos guardados" description="El historial aparecerá aquí cada vez que guardes una simulación de costo y precio." />
      )}
    </>
  );
}
