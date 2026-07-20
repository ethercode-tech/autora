import { describe, expect, it } from "vitest";
import { buildDashboardMetrics } from "@/features/dashboard/lib/build-dashboard-metrics";

describe("buildDashboardMetrics", () => {
  it("aggregates sales, incomes, expenses and balance", () => {
    const metrics = buildDashboardMetrics({
      sales: [
        { id: "sale-1", date: "2026-07-01", total: 1000, notes: null },
        { id: "sale-2", date: "2026-07-02", total: 500, notes: "Mayorista" }
      ],
      finances: [
        { id: "fm-1", type: "income", amount: 1000, date: "2026-07-01", description: "Venta" },
        { id: "fm-2", type: "income", amount: 500, date: "2026-07-02", description: "Venta" },
        { id: "fm-3", type: "expense", amount: 350, date: "2026-07-03", description: "Compra" }
      ],
      resourceStock: [],
      productStock: []
    });

    expect(metrics.monthlySales).toBe(1500);
    expect(metrics.monthlyIncome).toBe(1500);
    expect(metrics.monthlyExpense).toBe(350);
    expect(metrics.monthlyBalance).toBe(1150);
  });

  it("counts stock alerts when current stock is at or below minimum", () => {
    const metrics = buildDashboardMetrics({
      sales: [],
      finances: [],
      resourceStock: [
        { id: "resource-1", name: "Cera", currentStock: 5, minimumStock: 10 },
        { id: "resource-2", name: "Fragancia", currentStock: 15, minimumStock: 10 }
      ],
      productStock: [
        { id: "product-1", name: "Vela", currentStock: 2, minimumStock: 2 },
        { id: "product-2", name: "Difusor", currentStock: 6, minimumStock: null }
      ]
    });

    expect(metrics.stockAlerts).toBe(2);
  });

  it("limits recent activity lists to the five most recent items already ordered by the query layer", () => {
    const sales = Array.from({ length: 7 }, (_, index) => ({
      id: `sale-${index}`,
      date: `2026-07-${String(index + 1).padStart(2, "0")}`,
      total: index + 1,
      notes: null
    }));
    const finances = Array.from({ length: 6 }, (_, index) => ({
      id: `fm-${index}`,
      type: index % 2 === 0 ? ("income" as const) : ("expense" as const),
      amount: index + 1,
      date: `2026-07-${String(index + 1).padStart(2, "0")}`,
      description: `Movimiento ${index + 1}`
    }));

    const metrics = buildDashboardMetrics({
      sales,
      finances,
      resourceStock: [],
      productStock: []
    });

    expect(metrics.recentSales).toHaveLength(5);
    expect(metrics.recentSales[0]?.id).toBe("sale-0");
    expect(metrics.recentMovements).toHaveLength(5);
    expect(metrics.recentMovements[0]?.id).toBe("fm-0");
  });
});
