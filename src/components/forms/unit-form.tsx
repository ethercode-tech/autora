"use client";

import { useActionState } from "react";
import { createMeasurementUnit } from "@/server/actions/catalog";
import type { ActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

export function UnitForm() {
  const [state, action, pending] = useActionState(createMeasurementUnit, initialState);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-3">
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="name" placeholder="Unidad" required />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="symbol" placeholder="kg, un, ml" required />
      <Button disabled={pending} type="submit">
        {pending ? "Guardando..." : "Agregar unidad"}
      </Button>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 sm:col-span-3" : "text-sm text-rose-700 sm:col-span-3"}>{state.message}</p> : null}
    </form>
  );
}
