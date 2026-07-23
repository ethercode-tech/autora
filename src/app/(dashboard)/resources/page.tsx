import { Card } from "@/components/ui/card";
import { ResourceForm } from "@/components/forms/resource-form";
import { ResourceActions } from "@/components/forms/resource-actions";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { getMeasurementUnits, getResources } from "@/server/queries/catalog";

export default async function ResourcesPage() {
  const [measurementUnits, resources] = await Promise.all([getMeasurementUnits(), getResources()]);

  return (
    <>
      <PageHeader eyebrow="Módulo 1" title="Recursos" description="Registra los insumos que usas en tu emprendimiento." />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nuevo recurso</h3>
        <p className="mt-1 text-sm text-autora-ink/70">Carga su nombre, unidad de medida y la cantidad que contiene cada envase.</p>
        <div className="mt-4">
          {measurementUnits.length > 0 ? <ResourceForm measurementUnits={measurementUnits} /> : <p className="text-sm text-amber-700">Primero necesitas crear una unidad de medida desde Configuración.</p>}
        </div>
      </Card>
      {resources.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{resource.name}</h3>
                  <p className="mt-1 text-sm text-autora-ink/70">Unidad: {resource.measurement_units?.name ?? "Sin unidad"} {resource.measurement_units?.symbol ? `(${resource.measurement_units.symbol})` : ""}</p>
                </div>
              </div>
              <dl className="mt-4">
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Cantidad por envase</dt>
                  <dd className="mt-1 text-sm">{resource.pack_quantity}</dd>
                </div>
              </dl>
              <ResourceActions measurementUnits={measurementUnits} resource={resource} />
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No hay recursos cargados" description="Cuando registres tus primeros insumos, aparecerán aquí listos para usar en compras." />
      )}
    </>
  );
}
