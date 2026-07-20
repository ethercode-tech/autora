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

export function buildBusinessExportPayload(
  data: Omit<BusinessExportPayload, "generatedAt">,
  generatedAt = new Date().toISOString()
): BusinessExportPayload {
  return {
    generatedAt,
    ...data
  };
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
