"use client";

import { useActionState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { savePricingCalculation } from "@/server/actions/pricing";
import type { ActionResult } from "@/server/actions/auth";
import type { ProductRow, ResourceRow } from "@/server/queries/catalog";

type PricingFormValues = { resourceLines: Array<{ resourceId: string; quantity: number }> };
const initialState: ActionResult = { success: false, message: "" };

export function PricingForm({ products, resources }: { products: ProductRow[]; resources: ResourceRow[] }) {
  const [state, action, pending] = useActionState(savePricingCalculation, initialState);
  const { control, register, watch } = useForm<PricingFormValues>({ defaultValues: { resourceLines: [{ resourceId: "", quantity: 1 }] } });
  const { fields, append, remove } = useFieldArray({ control, name: "resourceLines" });
  const lines = watch("resourceLines");

  return (
    <form action={action} className="grid gap-3 lg:grid-cols-2">
      <select className="rounded-2xl border border-autora-sand px-4 py-3" defaultValue="" name="productId" required>
        <option disabled value="">Selecciona un producto</option>
        {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
      </select>
      <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" name="profitPercentage" placeholder="Ganancia %" required step="0.01" type="number" />
      <input name="resourceLines" type="hidden" value={JSON.stringify(lines)} readOnly />
      <div className="grid gap-2 lg:col-span-2">
        <p className="text-sm font-medium">Recursos utilizados</p>
        {fields.map((field, index) => (
          <div className="grid gap-2 sm:grid-cols-[1fr_160px_auto]" key={field.id}>
            <select className="rounded-2xl border border-autora-sand px-4 py-3" {...register(`resourceLines.${index}.resourceId`)} required>
              <option value="">Selecciona un recurso</option>
              {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}
            </select>
            <input className="rounded-2xl border border-autora-sand px-4 py-3" min="0" step="0.001" type="number" {...register(`resourceLines.${index}.quantity`, { valueAsNumber: true })} required />
            <Button aria-label="Quitar recurso" disabled={fields.length === 1} onClick={() => remove(index)} type="button" variant="ghost">Quitar</Button>
          </div>
        ))}
        <div><Button onClick={() => append({ resourceId: "", quantity: 1 })} type="button" variant="secondary">Agregar recurso</Button></div>
      </div>
      <div className="lg:col-span-2"><Button disabled={pending} type="submit">{pending ? "Calculando..." : "Calcular y guardar"}</Button></div>
      {state.message ? <p className={state.success ? "text-sm text-emerald-700 lg:col-span-2" : "text-sm text-rose-700 lg:col-span-2"}>{state.message}</p> : null}
    </form>
  );
}
