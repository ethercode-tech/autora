import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ConsumptionForm } from "@/components/forms/consumption-form";
import { PageHeader } from "@/components/layout/page-header";
import { getProfileData, getResourceConsumptions, getResources } from "@/server/queries/catalog";

export default async function ConsumptionsPage() {
  const [profile, resources, consumptions] = await Promise.all([getProfileData(), getResources(), getResourceConsumptions()]);

  if (profile?.business_type === "reseller") {
    return (
      <>
        <PageHeader eyebrow="Operaciones" title="Consumos" description="Los consumos manuales solo aplican a cuentas que manejan recursos." />
        <EmptyState title="Modulo no requerido para reventa" description="Las cuentas de reventa no consumen insumos productivos." />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Operaciones"
        title="Consumos manuales"
        description="Registra pérdidas, pruebas, desperdicios o usos no productivos sin romper la trazabilidad del inventario."
      />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nuevo consumo</h3>
        <p className="mt-1 text-sm text-autora-ink/70">Cada consumo descuenta stock del recurso y deja trazabilidad del motivo.</p>
        <div className="mt-4">
          {resources.length > 0 ? (
            <ConsumptionForm resources={resources} />
          ) : (
            <p className="text-sm text-amber-700">Primero necesitas cargar recursos para poder registrar consumos.</p>
          )}
        </div>
      </Card>
      {consumptions.length > 0 ? (
        <div className="grid gap-4">
          {consumptions.map((consumption) => (
            <Card key={consumption.id}>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{consumption.resources?.name ?? "Recurso"} - {consumption.date}</h3>
                  <p className="text-sm text-autora-ink/70">{consumption.notes || "Sin motivo adicional."}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-autora-sage">Consumido</p>
                  <p className="mt-1 text-2xl font-semibold">{Number(consumption.quantity).toFixed(3)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Todavia no hay consumos" description="Los consumos manuales aparecerán aquí con impacto directo sobre el stock de recursos." />
      )}
    </>
  );
}
