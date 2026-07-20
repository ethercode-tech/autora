import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResultsPage from "@/app/(dashboard)/results/page";

vi.mock("@/components/layout/page-header", () => ({
  PageHeader: ({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
      {actions}
    </header>
  )
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section>
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
  getFinancialMovements: vi.fn(),
  getProductStockSummary: vi.fn(),
  getResourceStockSummary: vi.fn()
}));

describe("ResultsPage", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const catalog = await import("@/server/queries/catalog");

    vi.mocked(catalog.getResourceStockSummary).mockResolvedValue([
      {
        id: "resource-1",
        name: "Cera",
        currentStock: 8,
        minimumStock: 2
      }
    ]);
    vi.mocked(catalog.getProductStockSummary).mockResolvedValue([
      {
        id: "product-1",
        name: "Vela",
        currentStock: 4,
        minimumStock: 1
      }
    ]);
    vi.mocked(catalog.getFinancialMovements).mockResolvedValue([
      {
        id: "fm-1",
        type: "income",
        amount: 900,
        date: "2026-07-20",
        description: "Venta registrada"
      }
    ]);
  });

  it("renders both export links alongside current business data", async () => {
    render(await ResultsPage());

    expect(screen.getByRole("heading", { name: /stock y movimientos economicos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /exportar json/i })).toHaveAttribute("href", "/api/export");
    expect(screen.getByRole("link", { name: /exportar csv/i })).toHaveAttribute("href", "/api/export?format=csv");
    expect(screen.getByText("Cera")).toBeInTheDocument();
    expect(screen.getByText("Vela")).toBeInTheDocument();
    expect(screen.getByText("Venta registrada")).toBeInTheDocument();
  });
});
