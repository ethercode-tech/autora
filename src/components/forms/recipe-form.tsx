"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/server/actions/auth";
import { createRecipe } from "@/server/actions/production";
import type { ProductRow, ResourceRow } from "@/server/queries/catalog";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false, message: "" };

type RecipeFormProps = {
  products: ProductRow[];
  resources: ResourceRow[];
};

export function RecipeForm({ products, resources }: RecipeFormProps) {
  const [state, action, pending] = useActionState(createRecipe, initialState);
  const manufacturedProducts = products.filter((product) => product.product_type === "manufactured");

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="productId" required>
        <option disabled value="">
          Selecciona un producto fabricado
        </option>
        {manufacturedProducts.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" name="name" placeholder="Nombre de la receta" required />
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="yieldQuantity" placeholder="Rendimiento total" required step="0.001" type="number" />
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
      <input className="rounded-2xl border border-autora-sand px-4 py-3 lg:col-span-2" min="0" name="quantity" placeholder="Cantidad del recurso para ese rendimiento" required step="0.001" type="number" />
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Crear receta"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
