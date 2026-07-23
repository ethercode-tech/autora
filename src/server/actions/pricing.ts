"use server";

import { revalidatePath } from "next/cache";
import { calculateSuggestedPrice } from "@/features/pricing/lib/calculate-price";
import { writeStructuredLog } from "@/lib/observability/structured-log";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { savePricingCalculationSchema } from "@/lib/validation/pricing";
import type { ActionResult } from "@/server/actions/auth";

type PriceResult = ActionResult & { totalCost?: number; suggestedPrice?: number };

export async function savePricingCalculation(_: PriceResult, formData: FormData): Promise<PriceResult> {
  let resourceLines: unknown;

  try {
    resourceLines = JSON.parse(String(formData.get("resourceLines") ?? "[]"));
  } catch {
    return { success: false, message: "Revisa los recursos usados." };
  }

  const parsed = savePricingCalculationSchema.safeParse({
    productId: formData.get("productId"),
    profitPercentage: formData.get("profitPercentage"),
    resourceLines
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el calculo." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Necesitas iniciar sesion para guardar calculos." };
  }

  const [productResult, resourcesResult, purchasesResult] = await Promise.all([
    supabase.from("products").select("name").eq("id", parsed.data.productId).maybeSingle(),
    supabase.from("resources").select("id, name").in(
      "id",
      parsed.data.resourceLines.map((line) => line.resourceId)
    ),
    supabase
      .from("purchases")
      .select("resource_id, quantity, price_paid, date, created_at")
      .in(
        "resource_id",
        parsed.data.resourceLines.map((line) => line.resourceId)
      )
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
  ]);

  if (!productResult.data || productResult.error) {
    return { success: false, message: "No encontramos el producto seleccionado." };
  }

  const resourcesById = new Map((resourcesResult.data ?? []).map((resource) => [resource.id, resource.name]));
  const pricesByResource = new Map<string, number>();

  for (const purchase of purchasesResult.data ?? []) {
    if (!purchase.resource_id || pricesByResource.has(purchase.resource_id) || Number(purchase.quantity) <= 0) {
      continue;
    }
    pricesByResource.set(purchase.resource_id, Number(purchase.price_paid) / Number(purchase.quantity));
  }

  const missingCost = parsed.data.resourceLines.find((line) => !resourcesById.has(line.resourceId) || !pricesByResource.has(line.resourceId));
  if (missingCost) {
    return { success: false, message: "Cada recurso usado necesita al menos una compra registrada." };
  }

  const lines = parsed.data.resourceLines.map((line) => ({
    resourceId: line.resourceId,
    resourceName: resourcesById.get(line.resourceId) ?? "Recurso",
    quantityUsed: line.quantity,
    unitCost: pricesByResource.get(line.resourceId) ?? 0
  }));
  const calculation = calculateSuggestedPrice(lines, 1, parsed.data.profitPercentage);

  const { error } = await supabase.from("pricing_history").insert({
    user_id: user.id,
    product_id: parsed.data.productId,
    total_cost: calculation.totalCost,
    profit_percentage: parsed.data.profitPercentage,
    suggested_price: calculation.suggestedPrice,
    resources_used: lines
  });

  if (error) {
    writeStructuredLog("error", "pricing.persist_failed", { message: error.message, productId: parsed.data.productId });
    return { success: false, message: "No pudimos guardar el historial del calculo." };
  }

  revalidatePath("/pricing");
  writeStructuredLog("info", "pricing.calculation_saved", { productId: parsed.data.productId });

  return {
    success: true,
    message: "Calculo guardado en el historial.",
    totalCost: calculation.totalCost,
    suggestedPrice: calculation.suggestedPrice
  };
}
