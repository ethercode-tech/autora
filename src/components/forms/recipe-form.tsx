"use client";

import { useActionState, useState } from "react";
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
  const [items, setItems] = useState([{ id: "item-1" }]);
  const manufacturedProducts = products.filter((product) => product.product_type === "manufactured");

  function addItemRow() {
    setItems((currentItems) => [...currentItems, { id: `item-${currentItems.length + 1}` }]);
  }

  function removeItemRow(itemId: string) {
    setItems((currentItems) => (currentItems.length === 1 ? currentItems : currentItems.filter((item) => item.id !== itemId)));
  }

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
      <div className="grid gap-3 lg:col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-autora-ink">Insumos de la receta</p>
          <button
            className="rounded-2xl border border-autora-burgundy px-3 py-2 text-sm font-semibold text-autora-burgundy transition-opacity hover:opacity-90"
            onClick={addItemRow}
            type="button"
          >
            Agregar insumo
          </button>
        </div>
        {items.map((item, index) => (
          <div key={item.id} className="grid gap-3 rounded-2xl bg-autora-cream/60 p-4 lg:grid-cols-[minmax(0,1fr),220px,auto]">
            <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="resourceId[]" required>
              <option disabled value="">
                Selecciona un recurso
              </option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-2xl border border-autora-sand px-4 py-3"
              min="0"
              name="quantity[]"
              placeholder={`Cantidad del insumo ${index + 1}`}
              required
              step="0.001"
              type="number"
            />
            <button
              className="rounded-2xl border border-autora-sand px-3 py-2 text-sm font-semibold text-autora-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={items.length === 1}
              onClick={() => removeItemRow(item.id)}
              type="button"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
      <div className="lg:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Crear receta"}
        </Button>
      </div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
