"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { purchaseSchema, saleSchema } from "@/lib/validation/operations";
import type { ActionResult } from "@/server/actions/auth";

function formatSupabaseError(message: string | null) {
  switch (message) {
    case "ACCOUNT_NOT_ACTIVE":
      return "La cuenta debe estar activa para operar.";
    case "EMPTY_PURCHASE":
      return "La compra necesita al menos un item.";
    case "INVALID_PURCHASE_ITEM":
      return "La compra tiene cantidades o precios invalidos.";
    case "EMPTY_SALE":
      return "La venta necesita al menos un item.";
    case "INVALID_SALE_ITEM":
      return "La venta tiene cantidades o precios invalidos.";
    case "INSUFFICIENT_PRODUCT_STOCK":
      return "No hay stock suficiente para registrar la venta.";
    default:
      return "No pudimos registrar la operacion.";
  }
}

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
    return { success: false, message: formatSupabaseError(error.message) };
  }

  revalidatePath("/purchases");
  revalidatePath("/dashboard");
  revalidatePath("/results");

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
    return { success: false, message: formatSupabaseError(error.message) };
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/results");

  return { success: true, message: "Venta registrada." };
}
