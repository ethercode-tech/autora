"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resourceConsumptionSchema } from "@/lib/validation/consumption";
import type { ActionResult } from "@/server/actions/auth";

function formatConsumptionError(message: string | null) {
  switch (message) {
    case "ACCOUNT_NOT_ACTIVE":
      return "La cuenta debe estar activa para registrar consumos.";
    case "INVALID_CONSUMPTION_QUANTITY":
      return "La cantidad consumida debe ser mayor a cero.";
    case "INSUFFICIENT_RESOURCE_STOCK":
      return "No hay stock suficiente para registrar este consumo.";
    default:
      return "No pudimos registrar el consumo.";
  }
}

export async function createResourceConsumption(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = resourceConsumptionSchema.safeParse({
    resourceId: formData.get("resourceId"),
    quantity: formData.get("quantity"),
    date: formData.get("date"),
    notes: formData.get("notes") ?? ""
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el consumo." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("register_resource_consumption", {
    consumption_resource_id: parsed.data.resourceId,
    consumption_quantity: parsed.data.quantity,
    consumption_date: parsed.data.date,
    consumption_notes: parsed.data.notes?.trim() || null
  });

  if (error) {
    return { success: false, message: formatConsumptionError(error.message) };
  }

  revalidatePath("/consumptions");
  revalidatePath("/results");
  revalidatePath("/dashboard");

  return { success: true, message: "Consumo registrado." };
}
