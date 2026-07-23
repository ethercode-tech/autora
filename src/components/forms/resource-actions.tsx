"use client";

import { useActionState, useState } from "react";
import { deleteResource, updateResource } from "@/server/actions/catalog";
import type { ActionResult } from "@/server/actions/auth";
import type { MeasurementUnitRow, ResourceRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type ResourceActionsProps = {
  resource: ResourceRow;
  measurementUnits: MeasurementUnitRow[];
};

export function ResourceActions({ resource, measurementUnits }: ResourceActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction, updating] = useActionState(updateResource, initialState);
  const [deleteState, deleteAction, deleting] = useActionState(deleteResource, initialState);

  return (
    <div className="mt-5 border-t border-autora-sand pt-4">
      {isEditing ? (
        <form action={updateAction} className="grid gap-3 sm:grid-cols-2">
          <input name="resourceId" type="hidden" value={resource.id} />
          <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={resource.name} name="name" required />
          <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={resource.measurement_unit_id ?? ""} name="measurementUnitId" required>
            <option disabled value="">Selecciona una unidad</option>
            {measurementUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>)}
          </select>
          <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={resource.pack_quantity ?? ""} min="0.001" name="packQuantity" required step="0.001" type="number" />
          <input name="minimumStock" type="hidden" value={resource.minimum_stock ?? ""} />
          <div className="flex gap-2">
            <Button disabled={updating} type="submit">{updating ? "Guardando..." : "Guardar"}</Button>
            <Button onClick={() => setIsEditing(false)} type="button" variant="ghost">Cancelar</Button>
          </div>
          {updateState.message ? <p className={updateState.success ? "text-sm text-emerald-700 sm:col-span-2" : "text-sm text-rose-700 sm:col-span-2"}>{updateState.message}</p> : null}
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsEditing(true)} type="button" variant="secondary">Editar</Button>
          <form action={deleteAction}>
            <input name="resourceId" type="hidden" value={resource.id} />
            <Button disabled={deleting} type="submit" variant="ghost">{deleting ? "Eliminando..." : "Eliminar"}</Button>
          </form>
          {deleteState.message ? <p className={deleteState.success ? "self-center text-sm text-emerald-700" : "self-center text-sm text-rose-700"}>{deleteState.message}</p> : null}
        </div>
      )}
    </div>
  );
}
