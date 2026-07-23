"use server";

import { revalidatePath } from "next/cache";
import { writeStructuredLog } from "@/lib/observability/structured-log";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productionSchema } from "@/lib/validation/production";
import type { ActionResult } from "@/server/actions/auth";

/** @deprecated Recipes are intentionally outside the MVP. Kept for legacy routes. */
export async function createRecipe(_: ActionResult, __: FormData): Promise<ActionResult> {
  return { success: false, message: "Las recetas no forman parte de este MVP." };
}

export async function createProduction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = productionSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    date: formData.get("date"),
    note: formData.get("note") ?? ""
  });

  if (!parsed.success) {
    writeStructuredLog("warn", "production.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la produccion." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("register_mvp_production", {
    production_date: parsed.data.date,
    production_product_id: parsed.data.productId,
    production_quantity: parsed.data.quantity,
    production_note: parsed.data.note?.trim() || null
  });

  if (error) {
    writeStructuredLog("error", "production.persist_failed", {
      message: error.message,
      productId: parsed.data.productId,
    });
    return { success: false, message: "No pudimos registrar la produccion. Intenta nuevamente." };
  }

  revalidatePath("/production");
  revalidatePath("/results");
  revalidatePath("/dashboard");

  writeStructuredLog("info", "production.created", {
    productId: parsed.data.productId,
    date: parsed.data.date
  });

  return { success: true, message: "Produccion registrada." };
}
