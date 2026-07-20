"use client";

import { useActionState } from "react";
import { createPlan } from "@/server/actions/admin";
import type { ActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

export function PlanForm() {
  const [state, action, pending] = useActionState(createPlan, initialState);

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="name" placeholder="Nombre del plan" required />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="ARS" maxLength={3} name="currency" placeholder="Moneda" required />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="price" placeholder="Precio" required step="0.01" type="number" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="monthly" name="billingPeriod" placeholder="Periodo" required />
      <textarea className="rounded-2xl border border-autora-sand px-4 py-3 lg:col-span-2" name="description" placeholder="Descripcion opcional" rows={2} />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Crear plan"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
