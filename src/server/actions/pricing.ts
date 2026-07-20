"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { writeStructuredLog } from "@/lib/observability/structured-log";
import { savePricingCalculationSchema } from "@/lib/validation/pricing";
import { calculateSuggestedPrice } from "@/features/pricing/lib/calculate-price";
import { getPricingPreview } from "@/server/queries/catalog";
import type { ActionResult } from "@/server/actions/auth";

export async function savePricingCalculation(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = savePricingCalculationSchema.safeParse({
    productId: formData.get("productId"),
    recipeId: formData.get("recipeId"),
    producedQuantity: formData.get("producedQuantity"),
    profitPercentage: formData.get("profitPercentage")
  });

  if (!parsed.success) {
    writeStructuredLog("warn", "pricing.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el calculo." };
  }

  const preview = await getPricingPreview(parsed.data.recipeId, parsed.data.producedQuantity);

  if (!preview) {
    writeStructuredLog("warn", "pricing.preview_missing", {
      recipeId: parsed.data.recipeId
    });
    return { success: false, message: "No encontramos la receta seleccionada." };
  }

  if (preview.lines.length === 0) {
    writeStructuredLog("warn", "pricing.preview_without_lines", {
      recipeId: parsed.data.recipeId
    });
    return { success: false, message: "La receta no tiene insumos configurados." };
  }

  if (preview.lines.some((line) => line.unitCost === null)) {
    writeStructuredLog("warn", "pricing.preview_missing_costs", {
      recipeId: parsed.data.recipeId
    });
    return { success: false, message: "Falta costo vigente para al menos un recurso de la receta." };
  }

  const lines = preview.lines.map((line) => ({
    resourceId: line.resourceId,
    resourceName: line.resourceName,
    quantityUsed: line.quantityUsed,
    unitCost: line.unitCost ?? 0
  }));

  const calculation = calculateSuggestedPrice(lines, parsed.data.producedQuantity, parsed.data.profitPercentage);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    writeStructuredLog("warn", "pricing.session_missing");
    return { success: false, message: "Necesitas iniciar sesion para guardar calculos." };
  }

  const { error } = await supabase.from("pricing_calculations").insert({
    user_id: user.id,
    product_id: parsed.data.productId,
    product_name_snapshot: preview.productName,
    cost: calculation.unitCost,
    profit_percentage: parsed.data.profitPercentage,
    suggested_price: calculation.suggestedPrice,
    calculation_detail: {
      producedQuantity: parsed.data.producedQuantity,
      lines
    }
  });

  if (error) {
    writeStructuredLog("error", "pricing.persist_failed", {
      message: error.message,
      productId: parsed.data.productId,
      recipeId: parsed.data.recipeId
    });
    return { success: false, message: "No pudimos guardar el historial del calculo." };
  }

  revalidatePath("/pricing");

  writeStructuredLog("info", "pricing.calculation_saved", {
    productId: parsed.data.productId,
    recipeId: parsed.data.recipeId,
    producedQuantity: parsed.data.producedQuantity
  });

  return { success: true, message: "Calculo guardado en el historial." };
}
