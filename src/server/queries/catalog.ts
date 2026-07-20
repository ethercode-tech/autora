import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type MeasurementUnitRow = {
  id: string;
  name: string;
  symbol: string;
  active: boolean;
};

export type ResourceRow = {
  id: string;
  name: string;
  pack_quantity: number | null;
  minimum_stock: number | null;
  active: boolean;
  measurement_units: {
    name: string;
    symbol: string;
  } | null;
};

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  product_type: "manufactured" | "resale";
  sale_unit: string;
  default_sale_price: number | null;
  minimum_stock: number | null;
  active: boolean;
};

export type ProfileRow = {
  business_name: string | null;
  currency: string | null;
  business_type: "manufacturer" | "reseller" | null;
  timezone: string;
  onboarding_completed: boolean;
  account_status: Database["public"]["Tables"]["profiles"]["Row"]["account_status"];
};

export type AccessRequestRow = {
  id: string;
  name: string;
  email: string;
  business_name: string;
  status: string;
  requested_at: string;
};

export type AdminProfileRow = {
  user_id: string;
  business_name: string | null;
  business_type: "manufacturer" | "reseller" | null;
  account_status: string;
  currency: string | null;
};

export type PlanRow = {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_period: string;
  active: boolean;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  status: "pending" | "active" | "past_due" | "suspended" | "cancelled";
  starts_at: string | null;
  next_billing_at: string | null;
  plans: { name: string } | null;
};

export type PaymentRow = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "pending" | "confirmed" | "rejected";
  payment_method: string | null;
  created_at: string;
};

export type AdminAuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
};

export type PurchaseRow = {
  id: string;
  purchase_type: "resource" | "product";
  date: string;
  total: number;
  notes: string | null;
};

export type SaleRow = {
  id: string;
  date: string;
  total: number;
  notes: string | null;
};

export type FinancialMovementRow = {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  description: string;
};

export type StockSummaryRow = {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number | null;
};

export type RecipeRow = {
  id: string;
  name: string;
  yield_quantity: number;
  active: boolean;
  products: {
    id: string;
    name: string;
  } | null;
  recipe_items: Array<{
    quantity: number;
    resources: {
      name: string;
    } | null;
  }>;
};

export type ProductionRow = {
  id: string;
  date: string;
  quantity_produced: number;
  total_cost: number | null;
  unit_cost: number | null;
  notes: string | null;
  products: {
    name: string;
  } | null;
  recipes: {
    name: string;
  } | null;
};

export type ResourceConsumptionRow = {
  id: string;
  date: string;
  quantity: number;
  notes: string | null;
  resources: {
    name: string;
  } | null;
};

export type PricingHistoryRow = {
  id: string;
  created_at: string;
  cost: number;
  profit_percentage: number;
  suggested_price: number;
  product_name_snapshot: string;
};

export type PricingPreview = {
  productName: string;
  lines: Array<{
    resourceId: string;
    resourceName: string;
    quantityUsed: number;
    unitCost: number | null;
  }>;
};

export async function getProfileData() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();

  return (data ?? null) as ProfileRow | null;
}

export async function getMeasurementUnits() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("measurement_units").select("id, name, symbol, active").order("name");

  return (data ?? []) as MeasurementUnitRow[];
}

export async function getResources() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("resources")
    .select("id, name, pack_quantity, minimum_stock, active, measurement_units(name, symbol)")
    .order("created_at", { ascending: false });

  return ((data ?? []) as Array<{
    id: string;
    name: string;
    pack_quantity: number | null;
    minimum_stock: number | null;
    active: boolean;
    measurement_units: Array<{ name: string; symbol: string }> | null;
  }>).map((resource) => ({
    ...resource,
    measurement_units: resource.measurement_units?.[0] ?? null
  }));
}

export async function getProducts() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, description, sku, product_type, sale_unit, default_sale_price, minimum_stock, active")
    .order("created_at", { ascending: false });

  return (data ?? []) as ProductRow[];
}

export async function getAccessRequests() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("access_requests")
    .select("id, name, email, business_name, status, requested_at")
    .order("requested_at", { ascending: false })
    .limit(10);

  return (data ?? []) as AccessRequestRow[];
}

export async function getAdminProfiles() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("user_id, business_name, business_type, account_status, currency")
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []) as AdminProfileRow[];
}

export async function getPlans() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("plans").select("id, name, price, currency, billing_period, active").order("created_at", { ascending: false });

  return (data ?? []) as PlanRow[];
}

export async function getSubscriptions() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("id, user_id, status, starts_at, next_billing_at, plans(name)")
    .order("created_at", { ascending: false })
    .limit(20);

  return ((data ?? []) as Array<{
    id: string;
    user_id: string;
    status: "pending" | "active" | "past_due" | "suspended" | "cancelled";
    starts_at: string | null;
    next_billing_at: string | null;
    plans: Array<{ name: string }> | null;
  }>).map((subscription) => ({
    id: subscription.id,
    user_id: subscription.user_id,
    status: subscription.status,
    starts_at: subscription.starts_at,
    next_billing_at: subscription.next_billing_at,
    plans: subscription.plans?.[0] ?? null
  }));
}

export async function getPayments() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("payments")
    .select("id, user_id, amount, currency, status, payment_method, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []) as PaymentRow[];
}

export async function getAdminDashboardMetrics() {
  const [requests, profiles, subscriptions, payments] = await Promise.all([
    getAccessRequests(),
    getAdminProfiles(),
    getSubscriptions(),
    getPayments()
  ]);

  return {
    pendingRequests: requests.filter((request) => request.status === "pending").length,
    activeAccounts: profiles.filter((profile) => profile.account_status === "active").length,
    blockedAccounts: profiles.filter((profile) => profile.account_status === "blocked").length,
    activeSubscriptions: subscriptions.filter((subscription) => subscription.status === "active").length,
    registeredPayments: payments.length,
    recentRequests: requests.slice(0, 10)
  };
}

export async function getAdminAuditLogs() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("admin_audit_logs")
    .select("id, action, entity_type, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []) as AdminAuditRow[];
}

export async function getPurchases() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("purchases")
    .select("id, purchase_type, date, total, notes")
    .order("date", { ascending: false })
    .limit(12);

  return (data ?? []) as PurchaseRow[];
}

export async function getSales() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("sales").select("id, date, total, notes").order("date", { ascending: false }).limit(12);

  return (data ?? []) as SaleRow[];
}

export async function getFinancialMovements() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("financial_movements")
    .select("id, type, amount, date, description")
    .order("date", { ascending: false })
    .limit(20);

  return (data ?? []) as FinancialMovementRow[];
}

export async function getResourceStockSummary() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("resource_stock_view").select("resource_id, name, current_stock, minimum_stock").order("name");

  return ((data ?? []) as Array<{ resource_id: string; name: string; current_stock: number; minimum_stock: number | null }>).map((item) => ({
    id: item.resource_id,
    name: item.name,
    currentStock: item.current_stock,
    minimumStock: item.minimum_stock
  }));
}

export async function getProductStockSummary() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("product_stock_view").select("product_id, name, current_stock, minimum_stock").order("name");

  return ((data ?? []) as Array<{ product_id: string; name: string; current_stock: number; minimum_stock: number | null }>).map((item) => ({
    id: item.product_id,
    name: item.name,
    currentStock: item.current_stock,
    minimumStock: item.minimum_stock
  }));
}

export async function getDashboardMetrics() {
  const [sales, finances, resourceStock, productStock] = await Promise.all([
    getSales(),
    getFinancialMovements(),
    getResourceStockSummary(),
    getProductStockSummary()
  ]);

  const income = finances.filter((movement) => movement.type === "income").reduce((sum, movement) => sum + Number(movement.amount), 0);
  const expense = finances.filter((movement) => movement.type === "expense").reduce((sum, movement) => sum + Number(movement.amount), 0);
  const alerts = [...resourceStock, ...productStock].filter(
    (item) => item.minimumStock !== null && Number(item.currentStock) <= Number(item.minimumStock)
  ).length;

  return {
    monthlySales: sales.reduce((sum, sale) => sum + Number(sale.total), 0),
    monthlyIncome: income,
    monthlyExpense: expense,
    monthlyBalance: income - expense,
    stockAlerts: alerts,
    recentSales: sales.slice(0, 5),
    recentMovements: finances.slice(0, 5)
  };
}

export async function getRecipes() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("recipes")
    .select("id, name, yield_quantity, active, products(id, name), recipe_items(quantity, resources(name))")
    .order("created_at", { ascending: false });

  return ((data ?? []) as Array<{
    id: string;
    name: string;
    yield_quantity: number;
    active: boolean;
    products: Array<{ id: string; name: string }> | null;
    recipe_items: Array<{ quantity: number; resources: Array<{ name: string }> | null }>;
  }>).map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    yield_quantity: recipe.yield_quantity,
    active: recipe.active,
    products: recipe.products?.[0] ?? null,
    recipe_items: recipe.recipe_items.map((item) => ({
      quantity: item.quantity,
      resources: item.resources?.[0] ?? null
    }))
  }));
}

export async function getProductionOrders() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("production_orders")
    .select("id, date, quantity_produced, total_cost, unit_cost, notes, products(name), recipes(name)")
    .order("date", { ascending: false })
    .limit(12);

  return ((data ?? []) as Array<{
    id: string;
    date: string;
    quantity_produced: number;
    total_cost: number | null;
    unit_cost: number | null;
    notes: string | null;
    products: Array<{ name: string }> | null;
    recipes: Array<{ name: string }> | null;
  }>).map((order) => ({
    id: order.id,
    date: order.date,
    quantity_produced: order.quantity_produced,
    total_cost: order.total_cost,
    unit_cost: order.unit_cost,
    notes: order.notes,
    products: order.products?.[0] ?? null,
    recipes: order.recipes?.[0] ?? null
  }));
}

export async function getResourceConsumptions() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("resource_consumptions")
    .select("id, date, quantity, notes, resources(name)")
    .order("date", { ascending: false })
    .limit(12);

  return ((data ?? []) as Array<{
    id: string;
    date: string;
    quantity: number;
    notes: string | null;
    resources: Array<{ name: string }> | null;
  }>).map((consumption) => ({
    id: consumption.id,
    date: consumption.date,
    quantity: consumption.quantity,
    notes: consumption.notes,
    resources: consumption.resources?.[0] ?? null
  }));
}

export async function getPricingHistory() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("pricing_calculations")
    .select("id, created_at, cost, profit_percentage, suggested_price, product_name_snapshot")
    .order("created_at", { ascending: false })
    .limit(12);

  return (data ?? []) as PricingHistoryRow[];
}

export async function getPricingPreview(recipeId: string, producedQuantity: number): Promise<PricingPreview | null> {
  const supabase = await createSupabaseServerClient();
  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, name, yield_quantity, products(name), recipe_items(resource_id, quantity, resources(name))")
    .eq("id", recipeId)
    .maybeSingle();

  if (!recipe) {
    return null;
  }

  const recipeItems = (recipe.recipe_items ?? []) as Array<{
    resource_id: string;
    quantity: number;
    resources: Array<{ name: string }> | null;
  }>;

  const resourceIds = recipeItems.map((item) => item.resource_id);
  const { data: purchaseItems } = await supabase
    .from("purchase_items")
    .select("resource_id, unit_price, individual_unit_price, created_at")
    .in("resource_id", resourceIds)
    .order("created_at", { ascending: false });

  const latestCosts = new Map<string, number>();

  for (const item of (purchaseItems ?? []) as Array<{ resource_id: string | null; unit_price: number | null; individual_unit_price: number | null }>) {
    if (!item.resource_id || latestCosts.has(item.resource_id)) {
      continue;
    }

    latestCosts.set(item.resource_id, Number(item.individual_unit_price ?? item.unit_price ?? 0));
  }

  const yieldQuantity = Number((recipe as { yield_quantity: number }).yield_quantity);

  return {
    productName: ((recipe as { products: Array<{ name: string }> | null }).products?.[0]?.name ?? "Producto"),
    lines: recipeItems.map((item) => ({
      resourceId: item.resource_id,
      resourceName: item.resources?.[0]?.name ?? "Recurso",
      quantityUsed: (Number(item.quantity) / yieldQuantity) * producedQuantity,
      unitCost: latestCosts.has(item.resource_id) ? latestCosts.get(item.resource_id) ?? null : null
    }))
  };
}
