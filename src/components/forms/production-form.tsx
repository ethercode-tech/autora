"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createProduction } from "@/server/actions/production";
import type { ActionResult } from "@/server/actions/auth";
import type { ProductRow } from "@/server/queries/catalog";

const initialState: ActionResult = { success: false, message: "" };

export function ProductionForm({ products }: { products: ProductRow[] }) {
  const [state, action, pending] = useActionState(createProduction, initialState);

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="productId" required>
        <option disabled value="">
          Selecciona un producto
        </option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={new Date().toISOString().slice(0, 10)} name="date" required type="date" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="quantity" placeholder="Cantidad producida" required step="0.001" type="number" />
      <textarea className="rounded-2xl border border-autora-sand px-4 py-3" name="note" placeholder="Nota opcional" rows={2} />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Registrar produccion"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
