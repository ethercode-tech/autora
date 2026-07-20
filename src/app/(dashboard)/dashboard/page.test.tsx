import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/(dashboard)/dashboard/page";

vi.mock("@/components/layout/page-header", () => ({
  PageHeader: ({ title, description }: { title: string; description: string }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section>
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>
}));

vi.mock("@/components/feedback/empty-state", () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div>
      <p>{title}</p>
      <p>{description}</p>
    </div>
  )
}));

vi.mock("@/server/queries/catalog", () => ({
  getDashboardMetrics: vi.fn()
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders KPI cards and recent activity when metrics exist", async () => {
    const catalog = await import("@/server/queries/catalog");

    vi.mocked(catalog.getDashboardMetrics).mockResolvedValue({
      monthlySales: 1500,
      monthlyIncome: 1500,
      monthlyExpense: 350,
      monthlyBalance: 1150,
      stockAlerts: 2,
      recentSales: [{ id: "sale-1", date: "2026-07-20", total: 900, notes: "Feria" }],
      recentMovements: [{ id: "fm-1", type: "income", amount: 900, date: "2026-07-20", description: "Venta registrada" }]
    });

    render(await DashboardPage());

    expect(screen.getByRole("heading", { name: /tu negocio, en un solo vistazo/i })).toBeInTheDocument();
    expect(screen.getByText("Ventas del mes")).toBeInTheDocument();
    expect(screen.getByText("1500.00")).toBeInTheDocument();
    expect(screen.getByText("Revisar")).toBeInTheDocument();
    expect(screen.getByText(/Venta del 2026-07-20/)).toBeInTheDocument();
    expect(screen.getByText("Venta registrada")).toBeInTheDocument();
  });

  it("renders empty states when there is no recent activity", async () => {
    const catalog = await import("@/server/queries/catalog");

    vi.mocked(catalog.getDashboardMetrics).mockResolvedValue({
      monthlySales: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      monthlyBalance: 0,
      stockAlerts: 0,
      recentSales: [],
      recentMovements: []
    });

    render(await DashboardPage());

    expect(screen.getByText(/todavia no hay ventas recientes/i)).toBeInTheDocument();
    expect(screen.getByText(/sin movimientos economicos/i)).toBeInTheDocument();
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });
});
