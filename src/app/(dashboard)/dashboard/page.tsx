import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { getDashboardMetrics } from "@/server/queries/catalog";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const kpis = [
    { label: "Ventas del mes", value: metrics.monthlySales, tone: "neutral" as const },
    { label: "Gastos del mes", value: metrics.monthlyExpense, tone: "neutral" as const },
    { label: "Saldo mensual", value: metrics.monthlyBalance, tone: "neutral" as const },
    { label: "Alertas de stock", value: metrics.stockAlerts, tone: metrics.stockAlerts > 0 ? ("warning" as const) : ("success" as const) }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Resumen"
        title="Mi stock actual"
        description="Consulta rapidamente el estado general del negocio con datos reales de ventas, gastos, saldo y alertas."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-autora-ink/70">{kpi.label}</p>
                <p className="mt-3 text-3xl font-semibold">{Number(kpi.value).toFixed(2)}</p>
              </div>
              <Badge tone={kpi.tone}>{kpi.label === "Alertas de stock" ? (Number(kpi.value) > 0 ? "Revisar" : "Normal") : "Actualizado"}</Badge>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        {metrics.recentSales.length > 0 ? (
          <Card>
            <h3 className="text-lg font-semibold">Ventas recientes</h3>
            <div className="mt-4 space-y-3">
              {metrics.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between rounded-2xl bg-autora-cream/60 px-4 py-3">
                  <div>
                    <p className="font-medium">Venta del {sale.date}</p>
                    <p className="text-sm text-autora-ink/70">{sale.notes || "Sin observaciones."}</p>
                  </div>
                  <p className="font-semibold">{Number(sale.total).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <EmptyState title="Todavia no hay ventas recientes" description="Cuando registres ventas reales, apareceran aqui con su impacto economico." />
        )}
        {metrics.recentMovements.length > 0 ? (
          <Card>
            <h3 className="text-lg font-semibold">Movimientos economicos</h3>
            <div className="mt-4 space-y-3">
              {metrics.recentMovements.map((movement) => (
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
          </Card>
        ) : (
          <EmptyState title="Sin movimientos economicos" description="Los ingresos y egresos automaticos apareceran aqui cuando registres compras o ventas." />
        )}
      </section>
    </>
  );
}
