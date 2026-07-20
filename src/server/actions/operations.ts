"use server";

import { revalidatePath } from "next/cache";
import { formatPurchaseOrSaleError } from "@/features/operations/lib/operation-feedback";
import { writeStructuredLog } from "@/lib/observability/structured-log";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { purchaseSchema, saleSchema } from "@/lib/validation/operations";
import type { ActionResult } from "@/server/actions/auth";

export async function createPurchase(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = purchaseSchema.safeParse({
    itemId: formData.get("itemId"),
    purchaseType: formData.get("purchaseType"),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
    date: formData.get("date"),
    notes: formData.get("notes") ?? ""
  });

  if (!parsed.success) {
    writeStructuredLog("warn", "purchase.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la compra." };
  }

  const supabase = await createSupabaseServerClient();
  const itemPayload =
    parsed.data.purchaseType === "resource"
      ? {
          resource_id: parsed.data.itemId,
          quantity: parsed.data.quantity,
          unit_price: parsed.data.unitPrice,
          total_price: parsed.data.quantity * parsed.data.unitPrice
        }
      : {
          product_id: parsed.data.itemId,
          quantity: parsed.data.quantity,
          unit_price: parsed.data.unitPrice,
          total_price: parsed.data.quantity * parsed.data.unitPrice
        };

  const { error } = await supabase.rpc("register_purchase", {
    purchase_date: parsed.data.date,
    purchase_type: parsed.data.purchaseType,
    purchase_notes: parsed.data.notes?.trim() || null,
    items: [itemPayload]
  });

  if (error) {
    writeStructuredLog("error", "purchase.persist_failed", {
      message: error.message,
      purchaseType: parsed.data.purchaseType
    });
    return { success: false, message: formatPurchaseOrSaleError(error.message) };
  }

  revalidatePath("/purchases");
  revalidatePath("/dashboard");
  revalidatePath("/results");

  writeStructuredLog("info", "purchase.created", {
    purchaseType: parsed.data.purchaseType,
    itemId: parsed.data.itemId,
    date: parsed.data.date
  });

  return { success: true, message: "Compra registrada." };
}

export async function createSale(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = saleSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
    date: formData.get("date"),
    notes: formData.get("notes") ?? ""
  });

  if (!parsed.success) {
    writeStructuredLog("warn", "sale.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la venta." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("register_sale", {
    sale_date: parsed.data.date,
    sale_notes: parsed.data.notes?.trim() || null,
    items: [
      {
        product_id: parsed.data.productId,
        quantity: parsed.data.quantity,
        unit_price: parsed.data.unitPrice
      }
    ]
  });

  if (error) {
    writeStructuredLog("error", "sale.persist_failed", {
      message: error.message,
      productId: parsed.data.productId
    });
    return { success: false, message: formatPurchaseOrSaleError(error.message) };
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/results");

  writeStructuredLog("info", "sale.created", {
    productId: parsed.data.productId,
    date: parsed.data.date
  });

  return { success: true, message: "Venta registrada." };
}
