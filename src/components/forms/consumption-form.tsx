"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/server/actions/auth";
import { createResourceConsumption } from "@/server/actions/consumption";
import type { ResourceRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type ConsumptionFormProps = {
  resources: ResourceRow[];
};

export function ConsumptionForm({ resources }: ConsumptionFormProps) {
  const [state, action, pending] = useActionState(createResourceConsumption, initialState);

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="resourceId" required>
        <option disabled value="">
          Selecciona un recurso
        </option>
        {resources.map((resource) => (
          <option key={resource.id} value={resource.id}>
            {resource.name}
          </option>
        ))}
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={new Date().toISOString().slice(0, 10)} name="date" required type="date" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="quantity" placeholder="Cantidad consumida" required step="0.001" type="number" />
      <textarea className="rounded-2xl border border-autora-sand px-4 py-3" name="notes" placeholder="Motivo o nota" rows={3} />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Registrar consumo"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
