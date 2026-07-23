"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/server/actions/auth";
import { createPurchase } from "@/server/actions/operations";
import type { ResourceRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type PurchaseFormProps = {
  resources: ResourceRow[];
};

export function PurchaseForm({ resources }: PurchaseFormProps) {
  const [state, action, pending] = useActionState(createPurchase, initialState);

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <input name="purchaseType" type="hidden" value="resource" />
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="itemId" required>
        <option disabled value="">
          Selecciona un recurso
        </option>
        {resources.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={new Date().toISOString().slice(0, 10)} name="date" required type="date" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="quantity" placeholder="Cantidad" required step="0.001" type="number" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="unitPrice" placeholder="Precio unitario" required step="0.01" type="number" />
      <textarea className="rounded-2xl border border-autora-sand px-4 py-3 lg:col-span-2" name="notes" placeholder="Nota opcional" rows={3} />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Registrar compra"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
