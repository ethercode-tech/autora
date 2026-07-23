import { getFinancialMovements, getPricingHistory, getProductStockSummary, getProducts, getProductionOrders, getProfileData, getPurchases, getRecipes, getResourceConsumptions, getResources, getResourceStockSummary, getSales } from "@/server/queries/catalog";

export type BusinessExportPayload = {
  generatedAt: string;
  profile: Awaited<ReturnType<typeof getProfileData>>;
  resources: Awaited<ReturnType<typeof getResources>>;
  resourceStock: Awaited<ReturnType<typeof getResourceStockSummary>>;
  products: Awaited<ReturnType<typeof getProducts>>;
  productStock: Awaited<ReturnType<typeof getProductStockSummary>>;
  recipes: Awaited<ReturnType<typeof getRecipes>>;
  purchases: Awaited<ReturnType<typeof getPurchases>>;
  consumptions: Awaited<ReturnType<typeof getResourceConsumptions>>;
  productionOrders: Awaited<ReturnType<typeof getProductionOrders>>;
  sales: Awaited<ReturnType<typeof getSales>>;
  financialMovements: Awaited<ReturnType<typeof getFinancialMovements>>;
  pricingHistory: Awaited<ReturnType<typeof getPricingHistory>>;
};

export type BusinessExportFormat = "json" | "csv";

type ExportCsvRow = Record<string, string | number | boolean | null>;

export function buildBusinessExportPayload(
  data: Omit<BusinessExportPayload, "generatedAt">,
  generatedAt = new Date().toISOString()
): BusinessExportPayload {
  return {
    generatedAt,
    ...data
  };
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const normalized = value === null || value === undefined ? "" : String(value);

  if (/[",\n]/u.test(normalized)) {
    return `"${normalized.replace(/"/gu, '""')}"`;
  }

  return normalized;
}

function serializeCsvRow(row: ExportCsvRow, columns: string[]) {
  return columns.map((column) => escapeCsvValue(row[column])).join(",");
}

export function buildBusinessExportCsv(payload: BusinessExportPayload) {
  const columns = ["section", "entity", "id", "name", "date", "status", "quantity", "amount", "detail"];
  const rows: ExportCsvRow[] = [];

  rows.push({
    section: "metadata",
    entity: "export",
    id: "",
    name: payload.profile?.business_name ?? "AUTORA",
    date: payload.generatedAt,
    status: payload.profile?.account_status ?? "",
    quantity: "",
    amount: "",
    detail: `currency=${payload.profile?.currency ?? ""};business_type=${payload.profile?.business_type ?? ""};timezone=${payload.profile?.timezone ?? ""}`
  });

  for (const resource of payload.resources) {
    rows.push({
      section: "catalog",
      entity: "resource",
      id: resource.id,
      name: resource.name,
      date: "",
      status: resource.active ? "active" : "inactive",
      quantity: resource.minimum_stock ?? "",
      amount: "",
      detail: `unit=${resource.measurement_units?.symbol ?? ""};pack_quantity=${resource.pack_quantity ?? ""}`
    });
  }

  for (const stock of payload.resourceStock) {
    rows.push({
      section: "inventory",
      entity: "resource_stock",
      id: stock.id,
      name: stock.name,
      date: "",
      status: "",
      quantity: stock.currentStock,
      amount: "",
      detail: `minimum_stock=${stock.minimumStock ?? ""}`
    });
  }

  for (const product of payload.products) {
    rows.push({
      section: "catalog",
      entity: "product",
      id: product.id,
      name: product.name,
      date: "",
      status: product.active ? "active" : "inactive",
      quantity: product.minimum_stock ?? "",
      amount: product.default_sale_price ?? "",
      detail: `product_type=${product.product_type};sale_unit=${product.sale_unit};sku=${product.sku ?? ""}`
    });
  }

  for (const stock of payload.productStock) {
    rows.push({
      section: "inventory",
      entity: "product_stock",
      id: stock.id,
      name: stock.name,
      date: "",
      status: "",
      quantity: stock.currentStock,
      amount: "",
      detail: `minimum_stock=${stock.minimumStock ?? ""}`
    });
  }

  for (const recipe of payload.recipes) {
    rows.push({
      section: "production",
      entity: "recipe",
      id: recipe.id,
      name: recipe.name,
      date: "",
      status: recipe.active ? "active" : "inactive",
      quantity: recipe.yield_quantity,
      amount: "",
      detail: `product=${recipe.products?.name ?? ""};items=${recipe.recipe_items.map((item) => `${item.resources?.name ?? "Recurso"}:${item.quantity}`).join("|")}`
    });
  }

  for (const purchase of payload.purchases) {
    rows.push({
      section: "operations",
      entity: "purchase",
      id: purchase.id,
      name: purchase.purchase_type,
      date: purchase.date,
      status: "",
      quantity: "",
      amount: purchase.total,
      detail: purchase.notes ?? ""
    });
  }

  for (const consumption of payload.consumptions) {
    rows.push({
      section: "operations",
      entity: "consumption",
      id: consumption.id,
      name: consumption.resources?.name ?? "Recurso",
      date: consumption.date,
      status: "",
      quantity: consumption.quantity,
      amount: "",
      detail: consumption.notes ?? ""
    });
  }

  for (const production of payload.productionOrders) {
    rows.push({
      section: "operations",
      entity: "production",
      id: production.id,
      name: production.products?.name ?? "Producto",
      date: production.date,
      status: "",
      quantity: production.quantity_produced,
      amount: production.total_cost ?? "",
      detail: `recipe=${production.recipes?.name ?? ""};unit_cost=${production.unit_cost ?? ""};notes=${production.notes ?? ""}`
    });
  }

  for (const sale of payload.sales) {
    rows.push({
      section: "operations",
      entity: "sale",
      id: sale.id,
      name: "sale",
      date: sale.date,
      status: "",
      quantity: "",
      amount: sale.total,
      detail: sale.notes ?? ""
    });
  }

  for (const movement of payload.financialMovements) {
    rows.push({
      section: "finance",
      entity: "financial_movement",
      id: movement.id,
      name: movement.description,
      date: movement.date,
      status: movement.type,
      quantity: "",
      amount: movement.amount,
      detail: ""
    });
  }

  for (const calculation of payload.pricingHistory) {
    rows.push({
      section: "pricing",
      entity: "pricing_calculation",
      id: calculation.id,
      name: calculation.product_name_snapshot ?? calculation.products?.name ?? "Producto",
      date: calculation.created_at,
      status: "",
      quantity: calculation.profit_percentage,
      amount: calculation.suggested_price,
      detail: `cost=${calculation.cost ?? calculation.total_cost ?? 0}`
    });
  }

  return [columns.join(","), ...rows.map((row) => serializeCsvRow(row, columns))].join("\n");
}

export async function getBusinessExportPayload() {
  const [
    profile,
    resources,
    resourceStock,
    products,
    productStock,
    recipes,
    purchases,
    consumptions,
    productionOrders,
    sales,
    financialMovements,
    pricingHistory
  ] = await Promise.all([
    getProfileData(),
    getResources(),
    getResourceStockSummary(),
    getProducts(),
    getProductStockSummary(),
    getRecipes(),
    getPurchases(),
    getResourceConsumptions(),
    getProductionOrders(),
    getSales(),
    getFinancialMovements(),
    getPricingHistory()
  ]);

  return buildBusinessExportPayload({
    profile,
    resources,
    resourceStock,
    products,
    productStock,
    recipes,
    purchases,
    consumptions,
    productionOrders,
    sales,
    financialMovements,
    pricingHistory
  });
}
