import { EmptyState } from "@/components/feedback/empty-state";
import { ProductionForm } from "@/components/forms/production-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getProductions, getProducts } from "@/server/queries/catalog";

export default async function ProductionPage() {
  const [products, productions] = await Promise.all([getProducts(), getProductions()]);

  return (
    <>
      <PageHeader eyebrow="Modulo 3" title="Produccion" description="Registra cada lote producido y aumenta automaticamente el stock del producto." />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nueva produccion</h3>
        <p className="mt-1 text-sm text-autora-ink/70">No necesitas cargar recetas para registrar una produccion.</p>
        <div className="mt-4">
          {products.length > 0 ? <ProductionForm products={products} /> : <p className="text-sm text-amber-700">Necesitas crear un producto antes de registrar produccion.</p>}
        </div>
      </Card>
      {productions.length > 0 ? (
        <div className="grid gap-4">
          {productions.map((production) => (
            <Card key={production.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{production.products?.name ?? "Producto"} - {production.date}</h3>
                  <p className="text-sm text-autora-ink/70">{production.note || "Sin observaciones."}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-autora-sage">Producido</p>
                  <p className="mt-1 text-2xl font-semibold">{Number(production.quantity).toFixed(3)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="Todavia no hay producciones" description="Las producciones que registres apareceran aqui." />}
    </>
  );
}
