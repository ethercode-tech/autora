import { Card } from "@/components/ui/card";
import { ResourceForm } from "@/components/forms/resource-form";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { getMeasurementUnits, getResources } from "@/server/queries/catalog";

export default async function ResourcesPage() {
  const [measurementUnits, resources] = await Promise.all([getMeasurementUnits(), getResources()]);

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Recursos"
        description="Administrá insumos, unidades, stock mínimo y trazabilidad de movimientos."
      />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">Nuevo recurso</h3>
        <p className="mt-1 text-sm text-autora-ink/70">Cada recurso queda vinculado a una unidad de medida y preparado para compras, recetas y alertas.</p>
        <div className="mt-4">
          {measurementUnits.length > 0 ? (
            <ResourceForm measurementUnits={measurementUnits} />
          ) : (
            <p className="text-sm text-amber-700">Primero necesitas crear al menos una unidad de medida desde Configuracion.</p>
          )}
        </div>
      </Card>
      {resources.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{resource.name}</h3>
                  <p className="mt-1 text-sm text-autora-ink/70">
                    Unidad: {resource.measurement_units?.name ?? "Sin unidad"} {resource.measurement_units?.symbol ? `(${resource.measurement_units.symbol})` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-autora-sand px-3 py-1 text-xs font-semibold">{resource.active ? "Activo" : "Archivado"}</span>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Pack</dt>
                  <dd className="mt-1 text-sm">{resource.pack_quantity ?? "No definido"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-autora-sage">Stock minimo</dt>
                  <dd className="mt-1 text-sm">{resource.minimum_stock ?? "No definido"}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay recursos cargados"
          description="Cuando registres tus primeros insumos, aparecerán aquí listos para compras, recetas y control de stock."
        />
      )}
    </>
  );
}
