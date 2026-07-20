"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/server/actions/auth";
import { savePricingCalculation } from "@/server/actions/pricing";
import type { ProductRow, RecipeRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type PricingFormProps = {
  products: ProductRow[];
  recipes: RecipeRow[];
};

export function PricingForm({ products, recipes }: PricingFormProps) {
  const [state, action, pending] = useActionState(savePricingCalculation, initialState);

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="productId" required>
        <option disabled value="">
          Selecciona un producto
        </option>
        {products.filter((product) => product.product_type === "manufactured").map((product) => (
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
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="producedQuantity" placeholder="Cantidad producida" required step="0.001" type="number" />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="profitPercentage" placeholder="Recargo %" required step="0.01" type="number" />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Calculando..." : "Guardar calculo"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
