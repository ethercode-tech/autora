"use client";

import { useActionState } from "react";
import { createResource } from "@/server/actions/catalog";
import type { ActionResult } from "@/server/actions/auth";
import type { MeasurementUnitRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type ResourceFormProps = {
  measurementUnits: MeasurementUnitRow[];
};

export function ResourceForm({ measurementUnits }: ResourceFormProps) {
  const [state, action, pending] = useActionState(createResource, initialState);

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-3">
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="name" placeholder="Nombre del recurso" required />
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="measurementUnitId" required>
        <option disabled value="">
          Selecciona una unidad
        </option>
        {measurementUnits.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.name} ({unit.symbol})
          </option>
        ))}
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="packQuantity" placeholder="Cantidad por envase" type="number" min="0.001" step="0.001" required />
      <div className="lg:col-span-3">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Crear recurso"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
