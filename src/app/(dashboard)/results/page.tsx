import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getFinancialMovements, getProductStockSummary, getResourceStockSummary } from "@/server/queries/catalog";

export default async function ResultsPage() {
  const [resourceStock, productStock, financialMovements] = await Promise.all([
    getResourceStockSummary(),
    getProductStockSummary(),
    getFinancialMovements()
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Resultados"
        title="Stock y movimientos economicos"
        description="Este agrupador concentra stock de recursos, stock de productos, ingresos, egresos, saldo e historial financiero."
        actions={
          <a
            className="inline-flex items-center rounded-2xl bg-autora-burgundy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            href="/api/export"
          >
            Exportar JSON
          </a>
        }
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Stock de recursos</h3>
          {resourceStock.length > 0 ? (
            <div className="mt-4 space-y-3">
              {resourceStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-autora-cream/60 px-4 py-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-autora-ink/70">Minimo: {item.minimumStock ?? "No definido"}</p>
                  </div>
                  <p className="font-semibold">{Number(item.currentStock).toFixed(3)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="Sin stock de recursos" description="Aparecera cuando registres compras o consumos." />
            </div>
          )}
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Stock de productos</h3>
          {productStock.length > 0 ? (
            <div className="mt-4 space-y-3">
              {productStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-autora-cream/60 px-4 py-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-autora-ink/70">Minimo: {item.minimumStock ?? "No definido"}</p>
                  </div>
                  <p className="font-semibold">{Number(item.currentStock).toFixed(3)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="Sin stock de productos" description="Aparecera cuando registres produccion o ventas." />
            </div>
          )}
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <h3 className="text-lg font-semibold">Movimientos economicos</h3>
          {financialMovements.length > 0 ? (
            <div className="mt-4 space-y-3">
              {financialMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between rounded-2xl bg-autora-cream/60 px-4 py-3">
                  <div>
                    <p className="font-medium">{movement.description}</p>
                    <p className="text-sm text-autora-ink/70">{movement.date}</p>
                  </div>
                  <p className="font-semibold">
                    {movement.type === "income" ? "+" : "-"}
                    {Number(movement.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="Sin movimientos economicos" description="Los ingresos y egresos automaticos o manuales se veran aqui." />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
