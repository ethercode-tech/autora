"use server";

import { revalidatePath } from "next/cache";
import { formatProductionError } from "@/features/operations/lib/operation-feedback";
import { writeStructuredLog } from "@/lib/observability/structured-log";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { recipeSchema } from "@/lib/validation/catalog";
import { productionSchema } from "@/lib/validation/production";
import type { ActionResult } from "@/server/actions/auth";

export async function createRecipe(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = recipeSchema.safeParse({
    productId: formData.get("productId"),
    name: formData.get("name"),
    yieldQuantity: formData.get("yieldQuantity"),
    resourceId: formData.get("resourceId"),
    quantity: formData.get("quantity")
  });

  if (!parsed.success) {
    writeStructuredLog("warn", "recipe.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la receta." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    writeStructuredLog("warn", "recipe.session_missing");
    return { success: false, message: "Necesitas iniciar sesion para crear recetas." };
  }

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      product_id: parsed.data.productId,
      name: parsed.data.name.trim(),
      yield_quantity: parsed.data.yieldQuantity
    })
    .select("id")
    .single();

  if (recipeError || !recipe) {
    writeStructuredLog("error", "recipe.persist_failed", {
      message: recipeError?.message ?? "recipe insert failed",
      productId: parsed.data.productId
    });
    return { success: false, message: "No pudimos crear la receta." };
  }

  const { error: recipeItemError } = await supabase.from("recipe_items").insert({
    user_id: user.id,
    recipe_id: recipe.id,
    resource_id: parsed.data.resourceId,
    quantity: parsed.data.quantity
  });

  if (recipeItemError) {
    writeStructuredLog("error", "recipe.items_persist_failed", {
      message: recipeItemError.message,
      recipeId: recipe.id,
      resourceId: parsed.data.resourceId
    });
    return { success: false, message: "No pudimos guardar los insumos de la receta." };
  }

  revalidatePath("/recipes");
  revalidatePath("/production");

  writeStructuredLog("info", "recipe.created", {
    recipeId: recipe.id,
    productId: parsed.data.productId
  });

  return { success: true, message: "Receta creada." };
}

export async function createProduction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = productionSchema.safeParse({
    productId: formData.get("productId"),
    recipeId: formData.get("recipeId"),
    quantity: formData.get("quantity"),
    date: formData.get("date"),
    notes: formData.get("notes") ?? ""
  });

  if (!parsed.success) {
    writeStructuredLog("warn", "production.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la produccion." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("register_production", {
    production_date: parsed.data.date,
    production_product_id: parsed.data.productId,
    production_recipe_id: parsed.data.recipeId,
    production_quantity: parsed.data.quantity,
    production_notes: parsed.data.notes?.trim() || null
  });

  if (error) {
    writeStructuredLog("error", "production.persist_failed", {
      message: error.message,
      productId: parsed.data.productId,
      recipeId: parsed.data.recipeId
    });
    return { success: false, message: formatProductionError(error.message) };
  }

  revalidatePath("/production");
  revalidatePath("/results");
  revalidatePath("/dashboard");

  writeStructuredLog("info", "production.created", {
    productId: parsed.data.productId,
    recipeId: parsed.data.recipeId,
    date: parsed.data.date
  });

  return { success: true, message: "Produccion registrada." };
}
