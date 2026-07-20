import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { loadResolvedEnv } from "./load-project-env.mjs";

const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
];

function requiredEnv(name, env) {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

export function buildLiveVerificationIdentity(prefix = "live-check") {
  const suffix = `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`;

  return {
    suffix,
    primaryEmail: `${suffix}-a@autora.local`,
    secondaryEmail: `${suffix}-b@autora.local`,
    password: `Autora!${randomUUID().slice(0, 12)}`
  };
}

export function createSummaryLines(result) {
  const lines = [
    `[live-supabase] status=${result.success ? "ok" : "failed"}`,
    `[live-supabase] created-users=${result.createdUsers}`,
    `[live-supabase] checks=${result.checks.length}`
  ];

  for (const check of result.checks) {
    lines.push(`[live-supabase] ${check.name}=${check.ok ? "ok" : "failed"}${check.detail ? ` (${check.detail})` : ""}`);
  }

  return lines;
}

function recordCheck(checks, name, ok, detail = "") {
  checks.push({ name, ok, detail });

  if (!ok) {
    throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  }
}

async function signInUser(url, anonKey, email, password) {
  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session || !data.user) {
    throw new Error(`Could not sign in ${email}: ${error?.message ?? "missing session"}`);
  }

  return {
    client,
    user: data.user
  };
}

async function createActiveUser(adminClient, email, password, businessName, businessType) {
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error || !data.user) {
    throw new Error(`Could not create user ${email}: ${error?.message ?? "missing user"}`);
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    user_id: data.user.id,
    business_name: businessName,
    currency: "ARS",
    business_type: businessType,
    account_status: "active",
    onboarding_completed: true,
    timezone: "America/Argentina/Buenos_Aires"
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(data.user.id);
    throw new Error(`Could not seed profile for ${email}: ${profileError.message}`);
  }

  return data.user;
}

async function cleanupUsers(adminClient, userIds) {
  for (const userId of userIds) {
    try {
      await adminClient.auth.admin.deleteUser(userId);
    } catch {
      // Cleanup should not mask the primary verification result.
    }
  }
}

export async function runLiveSupabaseVerification({ cwd = process.cwd(), env = process.env } = {}) {
  const resolvedEnv = await loadResolvedEnv(env, cwd);

  for (const key of REQUIRED_ENV_KEYS) {
    requiredEnv(key, resolvedEnv);
  }

  const url = resolvedEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = resolvedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = resolvedEnv.SUPABASE_SERVICE_ROLE_KEY;

  const adminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const identity = buildLiveVerificationIdentity();
  const createdUserIds = [];
  const checks = [];

  try {
    const userA = await createActiveUser(adminClient, identity.primaryEmail, identity.password, `AUTORA ${identity.suffix} A`, "manufacturer");
    const userB = await createActiveUser(adminClient, identity.secondaryEmail, identity.password, `AUTORA ${identity.suffix} B`, "manufacturer");
    createdUserIds.push(userA.id, userB.id);

    const primary = await signInUser(url, anonKey, identity.primaryEmail, identity.password);
    const secondary = await signInUser(url, anonKey, identity.secondaryEmail, identity.password);

    const { data: unit, error: unitError } = await primary.client
      .from("measurement_units")
      .insert({
        user_id: primary.user.id,
        name: `Unidad ${identity.suffix}`,
        normalized_name: `unidad-${identity.suffix}`,
        symbol: "un"
      })
      .select("id")
      .single();

    if (unitError || !unit) {
      throw new Error(`Could not create measurement unit: ${unitError?.message ?? "missing unit"}`);
    }

    const { data: resource, error: resourceError } = await primary.client
      .from("resources")
      .insert({
        user_id: primary.user.id,
        measurement_unit_id: unit.id,
        name: `Cera ${identity.suffix}`,
        normalized_name: `cera-${identity.suffix}`,
        minimum_stock: 2
      })
      .select("id")
      .single();

    if (resourceError || !resource) {
      throw new Error(`Could not create resource: ${resourceError?.message ?? "missing resource"}`);
    }

    const { data: product, error: productError } = await primary.client
      .from("products")
      .insert({
        user_id: primary.user.id,
        name: `Vela ${identity.suffix}`,
        normalized_name: `vela-${identity.suffix}`,
        product_type: "manufactured",
        sale_unit: "unidad",
        minimum_stock: 1
      })
      .select("id")
      .single();

    if (productError || !product) {
      throw new Error(`Could not create product: ${productError?.message ?? "missing product"}`);
    }

    const { data: recipe, error: recipeError } = await primary.client
      .from("recipes")
      .insert({
        user_id: primary.user.id,
        product_id: product.id,
        name: `Receta ${identity.suffix}`,
        yield_quantity: 2
      })
      .select("id")
      .single();

    if (recipeError || !recipe) {
      throw new Error(`Could not create recipe: ${recipeError?.message ?? "missing recipe"}`);
    }

    const { error: recipeItemError } = await primary.client.from("recipe_items").insert({
      user_id: primary.user.id,
      recipe_id: recipe.id,
      resource_id: resource.id,
      quantity: 4
    });

    if (recipeItemError) {
      throw new Error(`Could not create recipe item: ${recipeItemError.message}`);
    }

    const { data: purchaseId, error: purchaseError } = await primary.client.rpc("register_purchase", {
      purchase_date: "2026-07-20",
      purchase_type: "resource",
      purchase_notes: `live-${identity.suffix}-purchase`,
      items: [
        {
          resource_id: resource.id,
          quantity: 10,
          unit_price: 100,
          total_price: 1000
        }
      ]
    });

    if (purchaseError || !purchaseId) {
      throw new Error(`register_purchase failed: ${purchaseError?.message ?? "missing purchase id"}`);
    }

    const { data: consumptionId, error: consumptionError } = await primary.client.rpc("register_resource_consumption", {
      consumption_resource_id: resource.id,
      consumption_quantity: 2,
      consumption_date: "2026-07-20",
      consumption_notes: `live-${identity.suffix}-consumption`
    });

    if (consumptionError || !consumptionId) {
      throw new Error(`register_resource_consumption failed: ${consumptionError?.message ?? "missing consumption id"}`);
    }

    const { data: productionId, error: productionError } = await primary.client.rpc("register_production", {
      production_date: "2026-07-20",
      production_product_id: product.id,
      production_recipe_id: recipe.id,
      production_quantity: 4,
      production_notes: `live-${identity.suffix}-production`
    });

    if (productionError || !productionId) {
      throw new Error(`register_production failed: ${productionError?.message ?? "missing production id"}`);
    }

    const { data: saleId, error: saleError } = await primary.client.rpc("register_sale", {
      sale_date: "2026-07-20",
      sale_notes: `live-${identity.suffix}-sale`,
      items: [
        {
          product_id: product.id,
          quantity: 3,
          unit_price: 300
        }
      ]
    });

    if (saleError || !saleId) {
      throw new Error(`register_sale failed: ${saleError?.message ?? "missing sale id"}`);
    }

    const { data: resourceMovements } = await primary.client
      .from("inventory_movements")
      .select("quantity_signed, movement_type")
      .eq("resource_id", resource.id);
    const { data: productMovements } = await primary.client
      .from("inventory_movements")
      .select("quantity_signed, movement_type")
      .eq("product_id", product.id);
    const { data: financialMovements } = await primary.client
      .from("financial_movements")
      .select("type, amount, source_id")
      .in("source_id", [purchaseId, saleId]);
    const { data: productionOrder } = await primary.client
      .from("production_orders")
      .select("total_cost, unit_cost")
      .eq("id", productionId)
      .single();

    const resourceStock = (resourceMovements ?? []).reduce((total, movement) => total + Number(movement.quantity_signed), 0);
    const productStock = (productMovements ?? []).reduce((total, movement) => total + Number(movement.quantity_signed), 0);

    recordCheck(checks, "purchase_increases_resource_stock", resourceStock === 0, `resourceStock=${resourceStock}`);
    recordCheck(checks, "sale_decreases_product_stock", productStock === 1, `productStock=${productStock}`);
    recordCheck(
      checks,
      "production_records_costs",
      Number(productionOrder?.total_cost ?? 0) === 800 && Number(productionOrder?.unit_cost ?? 0) === 200,
      `totalCost=${productionOrder?.total_cost ?? "null"},unitCost=${productionOrder?.unit_cost ?? "null"}`
    );
    recordCheck(checks, "financial_movements_created", (financialMovements ?? []).length === 2, `count=${(financialMovements ?? []).length}`);

    const { data: crossRead, error: crossReadError } = await secondary.client.from("resources").select("id").eq("id", resource.id);
    if (crossReadError) {
      throw new Error(`cross read failed unexpectedly: ${crossReadError.message}`);
    }

    recordCheck(checks, "rls_hides_foreign_resources", (crossRead ?? []).length === 0, `rows=${(crossRead ?? []).length}`);

    const { error: crossInsertError } = await secondary.client.from("resources").insert({
      user_id: primary.user.id,
      measurement_unit_id: unit.id,
      name: `Intrusion ${identity.suffix}`,
      normalized_name: `intrusion-${identity.suffix}`
    });

    recordCheck(
      checks,
      "rls_blocks_foreign_inserts",
      Boolean(crossInsertError),
      crossInsertError?.message ?? "insert unexpectedly succeeded"
    );

    const { data: crossUpdate, error: crossUpdateError } = await secondary.client
      .from("resources")
      .update({ name: `Tampered ${identity.suffix}` })
      .eq("id", resource.id)
      .select("id");

    if (crossUpdateError) {
      recordCheck(checks, "rls_blocks_foreign_updates", true, crossUpdateError.message);
    } else {
      recordCheck(checks, "rls_blocks_foreign_updates", (crossUpdate ?? []).length === 0, `rows=${(crossUpdate ?? []).length}`);
    }

    const { error: blockProfileError } = await adminClient
      .from("profiles")
      .update({ account_status: "blocked" })
      .eq("user_id", primary.user.id);

    if (blockProfileError) {
      throw new Error(`Could not block test profile: ${blockProfileError.message}`);
    }

    const { error: blockedPurchaseError } = await primary.client.rpc("register_purchase", {
      purchase_date: "2026-07-20",
      purchase_type: "resource",
      purchase_notes: `live-${identity.suffix}-blocked`,
      items: [
        {
          resource_id: resource.id,
          quantity: 1,
          unit_price: 100,
          total_price: 100
        }
      ]
    });

    recordCheck(
      checks,
      "blocked_accounts_cannot_operate",
      Boolean(blockedPurchaseError) && blockedPurchaseError.message.includes("ACCOUNT_NOT_ACTIVE"),
      blockedPurchaseError?.message ?? "missing ACCOUNT_NOT_ACTIVE"
    );

    return {
      success: true,
      createdUsers: createdUserIds.length,
      checks
    };
  } finally {
    await cleanupUsers(adminClient, createdUserIds);
  }
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runLiveSupabaseVerification()
    .then((result) => {
      process.stdout.write(`${createSummaryLines(result).join("\n")}\n`);
    })
    .catch((error) => {
      process.stderr.write(`[live-supabase] status=failed\n[live-supabase] error=${error.message}\n`);
      process.exitCode = 1;
    });
}
