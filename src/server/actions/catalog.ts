"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeName } from "@/lib/utils/normalize";
import { measurementUnitSchema, productSchema, resourceSchema } from "@/lib/validation/catalog";
import { onboardingSchema } from "@/lib/validation/profile";
import type { ActionResult } from "@/server/actions/auth";

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  return Number(value);
}

export async function updateBusinessProfile(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = onboardingSchema.safeParse({
    businessName: formData.get("businessName"),
    currency: formData.get("currency"),
    businessType: formData.get("businessType"),
    timezone: formData.get("timezone")
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la configuracion." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Necesitas iniciar sesion para actualizar la cuenta." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      business_name: parsed.data.businessName,
      currency: parsed.data.currency.toUpperCase(),
      business_type: parsed.data.businessType,
      timezone: parsed.data.timezone,
      onboarding_completed: true
    })
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "No pudimos guardar la configuracion del emprendimiento." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true, message: "Configuracion actualizada." };
}

export async function createMeasurementUnit(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = measurementUnitSchema.safeParse({
    name: formData.get("name"),
    symbol: formData.get("symbol")
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la unidad." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Necesitas iniciar sesion para crear unidades." };
  }

  const { error } = await supabase.from("measurement_units").insert({
    user_id: user.id,
    name: parsed.data.name.trim(),
    normalized_name: normalizeName(parsed.data.name),
    symbol: parsed.data.symbol.trim()
  });

  if (error) {
    return { success: false, message: "No pudimos crear la unidad. Verifica que no este duplicada." };
  }

  revalidatePath("/resources");
  revalidatePath("/settings");

  return { success: true, message: "Unidad creada." };
}

export async function createResource(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = resourceSchema.safeParse({
    name: formData.get("name"),
    measurementUnitId: formData.get("measurementUnitId"),
    packQuantity: parseOptionalNumber(formData.get("packQuantity")),
    minimumStock: parseOptionalNumber(formData.get("minimumStock"))
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el recurso." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Necesitas iniciar sesion para crear recursos." };
  }

  const { error } = await supabase.from("resources").insert({
    user_id: user.id,
    measurement_unit_id: parsed.data.measurementUnitId,
    name: parsed.data.name.trim(),
    normalized_name: normalizeName(parsed.data.name),
    pack_quantity: parsed.data.packQuantity ?? null,
    minimum_stock: parsed.data.minimumStock ?? null
  });

  if (error) {
    return { success: false, message: "No pudimos crear el recurso. Verifica unidad y nombre." };
  }

  revalidatePath("/resources");
  revalidatePath("/dashboard");

  return { success: true, message: "Recurso creado." };
}

export async function updateResource(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const resourceId = formData.get("resourceId");
  const parsedId = typeof resourceId === "string" ? resourceId : "";
  const parsed = resourceSchema.safeParse({
    name: formData.get("name"),
    measurementUnitId: formData.get("measurementUnitId"),
    packQuantity: parseOptionalNumber(formData.get("packQuantity")),
    minimumStock: parseOptionalNumber(formData.get("minimumStock"))
  });

  if (!parsed.success || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parsedId)) {
    return { success: false, message: parsed.error?.issues[0]?.message ?? "No pudimos validar el recurso." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Necesitas iniciar sesion para editar recursos." };
  }

  const { error } = await supabase
    .from("resources")
    .update({
      measurement_unit_id: parsed.data.measurementUnitId,
      name: parsed.data.name.trim(),
      normalized_name: normalizeName(parsed.data.name),
      pack_quantity: parsed.data.packQuantity ?? null,
      minimum_stock: parsed.data.minimumStock ?? null
    })
    .eq("id", parsedId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "No pudimos actualizar el recurso. Verifica que el nombre no este duplicado." };
  }

  revalidatePath("/resources");
  revalidatePath("/purchases");
  revalidatePath("/dashboard");

  return { success: true, message: "Recurso actualizado." };
}

export async function deleteResource(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const resourceId = formData.get("resourceId");
  const parsedId = typeof resourceId === "string" ? resourceId : "";

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parsedId)) {
    return { success: false, message: "El recurso seleccionado no es valido." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Necesitas iniciar sesion para eliminar recursos." };
  }

  // Archivar conserva la trazabilidad de compras e inventario ya registrados.
  const { error } = await supabase
    .from("resources")
    .update({ active: false, archived_at: new Date().toISOString() })
    .eq("id", parsedId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: "No pudimos eliminar el recurso." };
  }

  revalidatePath("/resources");
  revalidatePath("/purchases");
  revalidatePath("/dashboard");

  return { success: true, message: "Recurso eliminado." };
}

export async function createProduct(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    sku: formData.get("sku") ?? "",
    productType: formData.get("productType"),
    saleUnit: formData.get("saleUnit"),
    defaultSalePrice: parseOptionalNumber(formData.get("defaultSalePrice")),
    minimumStock: parseOptionalNumber(formData.get("minimumStock"))
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el producto." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Necesitas iniciar sesion para crear productos." };
  }

  const { error } = await supabase.from("products").insert({
    user_id: user.id,
    name: parsed.data.name.trim(),
    normalized_name: normalizeName(parsed.data.name),
    description: parsed.data.description?.trim() || null,
    sku: parsed.data.sku?.trim() || null,
    product_type: parsed.data.productType,
    sale_unit: parsed.data.saleUnit.trim(),
    default_sale_price: parsed.data.defaultSalePrice ?? null,
    minimum_stock: parsed.data.minimumStock ?? null
  });

  if (error) {
    return { success: false, message: "No pudimos crear el producto. Verifica nombre, SKU y tipo." };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");

  return { success: true, message: "Producto creado." };
}
