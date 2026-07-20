import type { FinancialMovementRow, SaleRow, StockSummaryRow } from "@/server/queries/catalog";

export type DashboardMetrics = {
  monthlySales: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  stockAlerts: number;
  recentSales: SaleRow[];
  recentMovements: FinancialMovementRow[];
};

export function buildDashboardMetrics(params: {
  sales: SaleRow[];
  finances: FinancialMovementRow[];
  resourceStock: StockSummaryRow[];
  productStock: StockSummaryRow[];
}): DashboardMetrics {
  const { sales, finances, resourceStock, productStock } = params;
  const income = finances.filter((movement) => movement.type === "income").reduce((sum, movement) => sum + Number(movement.amount), 0);
  const expense = finances.filter((movement) => movement.type === "expense").reduce((sum, movement) => sum + Number(movement.amount), 0);
  const stockAlerts = [...resourceStock, ...productStock].filter(
    (item) => item.minimumStock !== null && Number(item.currentStock) <= Number(item.minimumStock)
  ).length;

  return {
    monthlySales: sales.reduce((sum, sale) => sum + Number(sale.total), 0),
    monthlyIncome: income,
    monthlyExpense: expense,
    monthlyBalance: income - expense,
    stockAlerts,
    recentSales: sales.slice(0, 5),
    recentMovements: finances.slice(0, 5)
  };
}
