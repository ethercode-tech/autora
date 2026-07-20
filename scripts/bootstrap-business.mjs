import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { loadResolvedEnv } from "./load-project-env.mjs";

const REQUIRED_ENV_KEYS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const DEFAULT_OPTIONS = {
  businessName: "Lumiq",
  businessType: "manufacturer",
  currency: "ARS",
  timezone: "America/Argentina/Buenos_Aires",
  accountStatus: "active",
  onboardingCompleted: true
};

function requiredEnv(name, env) {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function normalizeName(value) {
  return value.trim().toLocaleLowerCase("es-AR").replace(/\s+/gu, " ");
}

export function parseBootstrapBusinessArgs(argv = process.argv.slice(2)) {
  const options = { ...DEFAULT_OPTIONS };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    index += 1;

    switch (key) {
      case "email":
        options.email = value.trim().toLowerCase();
        break;
      case "password":
        options.password = value;
        break;
      case "business-name":
        options.businessName = value.trim();
        break;
      case "business-type":
        options.businessType = value.trim();
        break;
      case "currency":
        options.currency = value.trim().toUpperCase();
        break;
      case "timezone":
        options.timezone = value.trim();
        break;
      case "account-status":
        options.accountStatus = value.trim();
        break;
      default:
        throw new Error(`Unknown option: --${key}`);
    }
  }

  if (!options.email) {
    throw new Error("Pass --email <address> to create the business account.");
  }

  return options;
}

export function generateBusinessPassword() {
  return `Autora!${randomUUID().replace(/-/gu, "").slice(0, 12)}`;
}

async function findUserByEmail(adminClient, email) {
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 200
    });

    if (error) {
      throw new Error(`Could not list auth users: ${error.message}`);
    }

    const users = data?.users ?? [];
    const matchingUser = users.find((user) => user.email?.toLowerCase() === email);

    if (matchingUser) {
      return matchingUser;
    }

    if (users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function ensureProfile(adminClient, userId, options) {
  const payload = {
    user_id: userId,
    business_name: options.businessName,
    currency: options.currency,
    business_type: options.businessType,
    account_status: options.accountStatus,
    onboarding_completed: options.onboardingCompleted,
    timezone: options.timezone
  };

  const { data: existingProfile, error: profileLookupError } = await adminClient
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileLookupError) {
    throw new Error(`Could not resolve the business profile: ${profileLookupError.message}`);
  }

  if (existingProfile) {
    const { error: profileUpdateError } = await adminClient.from("profiles").update(payload).eq("user_id", userId);

    if (profileUpdateError) {
      throw new Error(`Could not update the business profile: ${profileUpdateError.message}`);
    }

    return "updated";
  }

  const { error: profileInsertError } = await adminClient.from("profiles").insert(payload);

  if (profileInsertError) {
    throw new Error(`Could not create the business profile: ${profileInsertError.message}`);
  }

  return "created";
}

async function ensureMeasurementUnit(adminClient, userId, name, symbol) {
  const normalizedName = normalizeName(name);
  const { data: existingUnit, error: lookupError } = await adminClient
    .from("measurement_units")
    .select("id")
    .eq("user_id", userId)
    .eq("normalized_name", normalizedName)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Could not resolve measurement unit ${name}: ${lookupError.message}`);
  }

  if (existingUnit) {
    return existingUnit.id;
  }

  const { data: createdUnit, error: insertError } = await adminClient
    .from("measurement_units")
    .insert({
      user_id: userId,
      name,
      normalized_name: normalizedName,
      symbol
    })
    .select("id")
    .single();

  if (insertError || !createdUnit) {
    throw new Error(`Could not create measurement unit ${name}: ${insertError?.message ?? "missing unit"}`);
  }

  return createdUnit.id;
}

async function ensureResource(adminClient, userId, measurementUnitId, resource) {
  const normalizedName = normalizeName(resource.name);
  const { data: existingResource, error: lookupError } = await adminClient
    .from("resources")
    .select("id")
    .eq("user_id", userId)
    .eq("normalized_name", normalizedName)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Could not resolve resource ${resource.name}: ${lookupError.message}`);
  }

  if (existingResource) {
    return existingResource.id;
  }

  const { data: createdResource, error: insertError } = await adminClient
    .from("resources")
    .insert({
      user_id: userId,
      measurement_unit_id: measurementUnitId,
      name: resource.name,
      normalized_name: normalizedName,
      minimum_stock: resource.minimumStock ?? null
    })
    .select("id")
    .single();

  if (insertError || !createdResource) {
    throw new Error(`Could not create resource ${resource.name}: ${insertError?.message ?? "missing resource"}`);
  }

  return createdResource.id;
}

async function ensureProduct(adminClient, userId, product) {
  const normalizedName = normalizeName(product.name);
  const { data: existingProduct, error: lookupError } = await adminClient
    .from("products")
    .select("id")
    .eq("user_id", userId)
    .eq("normalized_name", normalizedName)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Could not resolve product ${product.name}: ${lookupError.message}`);
  }

  if (existingProduct) {
    return existingProduct.id;
  }

  const { data: createdProduct, error: insertError } = await adminClient
    .from("products")
    .insert({
      user_id: userId,
      name: product.name,
      normalized_name: normalizedName,
      description: product.description,
      sku: product.sku,
      product_type: "manufactured",
      sale_unit: "unidad",
      default_sale_price: product.defaultSalePrice,
      minimum_stock: product.minimumStock
    })
    .select("id")
    .single();

  if (insertError || !createdProduct) {
    throw new Error(`Could not create product ${product.name}: ${insertError?.message ?? "missing product"}`);
  }

  return createdProduct.id;
}

async function ensureRecipe(adminClient, userId, productId, recipeName, yieldQuantity, items) {
  const { data: existingRecipe, error: lookupError } = await adminClient
    .from("recipes")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("name", recipeName)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Could not resolve recipe ${recipeName}: ${lookupError.message}`);
  }

  let recipeId = existingRecipe?.id ?? null;

  if (!recipeId) {
    const { data: createdRecipe, error: insertError } = await adminClient
      .from("recipes")
      .insert({
        user_id: userId,
        product_id: productId,
        name: recipeName,
        yield_quantity: yieldQuantity
      })
      .select("id")
      .single();

    if (insertError || !createdRecipe) {
      throw new Error(`Could not create recipe ${recipeName}: ${insertError?.message ?? "missing recipe"}`);
    }

    recipeId = createdRecipe.id;
  }

  for (const item of items) {
    const { data: existingItem, error: itemLookupError } = await adminClient
      .from("recipe_items")
      .select("id")
      .eq("recipe_id", recipeId)
      .eq("resource_id", item.resourceId)
      .maybeSingle();

    if (itemLookupError) {
      throw new Error(`Could not resolve recipe item for ${recipeName}: ${itemLookupError.message}`);
    }

    if (existingItem) {
      continue;
    }

    const { error: itemInsertError } = await adminClient.from("recipe_items").insert({
      user_id: userId,
      recipe_id: recipeId,
      resource_id: item.resourceId,
      quantity: item.quantity
    });

    if (itemInsertError) {
      throw new Error(`Could not create recipe item for ${recipeName}: ${itemInsertError.message}`);
    }
  }

  return recipeId;
}

async function seedLumiqCatalog(adminClient, userId) {
  const gramUnitId = await ensureMeasurementUnit(adminClient, userId, "Gramo", "g");
  const unitId = await ensureMeasurementUnit(adminClient, userId, "Unidad", "un");

  const plaWhiteId = await ensureResource(adminClient, userId, gramUnitId, {
    name: "Filamento PLA blanco",
    minimumStock: 500
  });
  const petgTranslucentId = await ensureResource(adminClient, userId, gramUnitId, {
    name: "Filamento PETG translucido",
    minimumStock: 500
  });
  const lightingKitId = await ensureResource(adminClient, userId, unitId, {
    name: "Kit electrico LED E27",
    minimumStock: 5
  });
  const packagingId = await ensureResource(adminClient, userId, unitId, {
    name: "Caja de empaque",
    minimumStock: 10
  });

  const orbitaLampId = await ensureProduct(adminClient, userId, {
    name: "Lampara Orbita 3D",
    description: "Lampara de mesa impresa en 3D con difusor y kit LED.",
    sku: "LUM-ORB-3D",
    defaultSalePrice: 45990,
    minimumStock: 2
  });
  await ensureProduct(adminClient, userId, {
    name: "Lampara Nube 3D",
    description: "Lampara decorativa impresa en 3D para ambientacion interior.",
    sku: "LUM-NUB-3D",
    defaultSalePrice: 38990,
    minimumStock: 2
  });

  const recipeId = await ensureRecipe(adminClient, userId, orbitaLampId, "Receta base Orbita", 1, [
    { resourceId: plaWhiteId, quantity: 320 },
    { resourceId: petgTranslucentId, quantity: 180 },
    { resourceId: lightingKitId, quantity: 1 },
    { resourceId: packagingId, quantity: 1 }
  ]);

  return {
    measurementUnitsSeeded: 2,
    resourcesSeeded: 4,
    productsSeeded: 2,
    recipeId
  };
}

export function createBootstrapBusinessSummary(result) {
  const lines = [
    `[business:bootstrap] status=ok`,
    `[business:bootstrap] business=${result.businessName}`,
    `[business:bootstrap] email=${result.email}`,
    `[business:bootstrap] user-id=${result.userId}`,
    `[business:bootstrap] auth-user=${result.authUserAction}`,
    `[business:bootstrap] profile=${result.profileAction}`,
    `[business:bootstrap] measurement-units=${result.seed.measurementUnitsSeeded}`,
    `[business:bootstrap] resources=${result.seed.resourcesSeeded}`,
    `[business:bootstrap] products=${result.seed.productsSeeded}`,
    `[business:bootstrap] recipe-id=${result.seed.recipeId}`
  ];

  if (result.password) {
    lines.push(`[business:bootstrap] password=${result.password}`);
  }

  return lines;
}

export async function runBootstrapBusiness({ argv = process.argv.slice(2), cwd = process.cwd(), env = process.env } = {}) {
  const options = parseBootstrapBusinessArgs(argv);
  const resolvedEnv = await loadResolvedEnv(env, cwd);

  for (const key of REQUIRED_ENV_KEYS) {
    requiredEnv(key, resolvedEnv);
  }

  const generatedPassword = options.password || generateBusinessPassword();
  const adminClient = createClient(resolvedEnv.NEXT_PUBLIC_SUPABASE_URL, resolvedEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  let user = await findUserByEmail(adminClient, options.email);
  let authUserAction = "existing";

  if (!user) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: options.email,
      password: generatedPassword,
      email_confirm: true
    });

    if (error || !data.user) {
      throw new Error(`Could not create the business auth user: ${error?.message ?? "missing user"}`);
    }

    user = data.user;
    authUserAction = "created";
  } else if (options.password) {
    const { data, error } = await adminClient.auth.admin.updateUserById(user.id, {
      password: generatedPassword,
      email_confirm: true
    });

    if (error || !data.user) {
      throw new Error(`Could not update the business auth user: ${error?.message ?? "missing user"}`);
    }

    user = data.user;
    authUserAction = "updated-password";
  }

  const profileAction = await ensureProfile(adminClient, user.id, options);
  const seed = await seedLumiqCatalog(adminClient, user.id);

  return {
    businessName: options.businessName,
    email: options.email,
    userId: user.id,
    authUserAction,
    profileAction,
    password: authUserAction === "existing" && !options.password ? null : generatedPassword,
    seed
  };
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runBootstrapBusiness()
    .then((result) => {
      process.stdout.write(`${createBootstrapBusinessSummary(result).join("\n")}\n`);
    })
    .catch((error) => {
      process.stderr.write(`[business:bootstrap] status=failed\n[business:bootstrap] error=${error.message}\n`);
      process.exitCode = 1;
    });
}
