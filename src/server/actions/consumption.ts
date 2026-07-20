"use server";

import { revalidatePath } from "next/cache";
import { formatConsumptionError } from "@/features/operations/lib/operation-feedback";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resourceConsumptionSchema } from "@/lib/validation/consumption";
import type { ActionResult } from "@/server/actions/auth";

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
