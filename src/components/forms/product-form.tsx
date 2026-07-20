"use client";

import { useActionState } from "react";
import { createProduct } from "@/server/actions/catalog";
import type { ActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

export function ProductForm() {
  const [state, action, pending] = useActionState(createProduct, initialState);

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="name" placeholder="Nombre del producto" required />
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="manufactured" name="productType" required>
        <option value="manufactured">Fabricado</option>
        <option value="resale">Reventa</option>
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="saleUnit" placeholder="Unidad de venta" defaultValue="unidad" required />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="sku" placeholder="SKU (opcional)" />
      <textarea className="rounded-2xl border border-autora-sand px-4 py-3 lg:col-span-2" name="description" placeholder="Descripcion breve (opcional)" rows={3} />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="defaultSalePrice" placeholder="Precio base (opcional)" type="number" min="0" step="0.01" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="minimumStock" placeholder="Stock minimo (opcional)" type="number" min="0" step="0.001" />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Crear producto"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
