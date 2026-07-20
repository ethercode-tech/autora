"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/server/actions/auth";
import { createProduction } from "@/server/actions/production";
import type { ProductRow, RecipeRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type ProductionFormProps = {
  products: ProductRow[];
  recipes: RecipeRow[];
};

export function ProductionForm({ products, recipes }: ProductionFormProps) {
  const [state, action, pending] = useActionState(createProduction, initialState);
  const manufacturedProducts = products.filter((product) => product.product_type === "manufactured");

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="productId" required>
        <option disabled value="">
          Selecciona un producto
        </option>
        {manufacturedProducts.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="recipeId" required>
        <option disabled value="">
          Selecciona una receta
        </option>
        {recipes.map((recipe) => (
          <option key={recipe.id} value={recipe.id}>
            {recipe.name}
          </option>
        ))}
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue={new Date().toISOString().slice(0, 10)} name="date" required type="date" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="quantity" placeholder="Cantidad a producir" required step="0.001" type="number" />
      <textarea className="rounded-2xl border border-autora-sand px-4 py-3 lg:col-span-2" name="notes" placeholder="Nota opcional" rows={3} />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Registrar produccion"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
