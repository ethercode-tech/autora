import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { SaleForm } from "@/components/forms/sale-form";
import { PageHeader } from "@/components/layout/page-header";
import { getProducts, getSales } from "@/server/queries/catalog";

export default async function SalesPage() {
  const [products, sales] = await Promise.all([getProducts(), getSales()]);

  return (
    <>
      <PageHeader
        eyebrow="Operaciones"
        title="Ventas"
        description="Cada venta debe validar stock disponible, descontar productos y registrar el ingreso económico en una sola operación."
      />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nueva venta</h3>
        <p className="mt-1 text-sm text-autora-ink/70">El stock y los movimientos financieros se recalculan automáticamente al confirmar.</p>
        <div className="mt-4">
          {products.length > 0 ? (
            <SaleForm products={products} />
          ) : (
            <p className="text-sm text-amber-700">Primero necesitas cargar productos para poder registrar ventas.</p>
          )}
        </div>
      </Card>
      {sales.length > 0 ? (
        <div className="grid gap-4">
          {sales.map((sale) => (
            <Card key={sale.id}>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Venta del {sale.date}</h3>
                  <p className="text-sm text-autora-ink/70">{sale.notes || "Sin observaciones."}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-autora-sage">Ingreso</p>
                  <p className="mt-1 text-2xl font-semibold">{Number(sale.total).toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Todavia no hay ventas" description="Las ventas que registres aparecerán aquí con descuento automático de stock." />
      )}
    </>
  );
}
