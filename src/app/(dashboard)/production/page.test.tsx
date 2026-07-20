import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductionPage from "@/app/(dashboard)/production/page";

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

vi.mock("@/components/feedback/empty-state", () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div>
      <p>{title}</p>
      <p>{description}</p>
    </div>
  )
}));

vi.mock("@/components/forms/production-form", () => ({
  ProductionForm: () => <form aria-label="production-form" />
}));

vi.mock("@/server/queries/catalog", () => ({
  getProducts: vi.fn(),
  getProductionOrders: vi.fn(),
  getProfileData: vi.fn(),
  getRecipes: vi.fn()
}));

describe("ProductionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks the module for reseller accounts", async () => {
    const catalog = await import("@/server/queries/catalog");

    vi.mocked(catalog.getProfileData).mockResolvedValue({
      business_name: "Reventa Sur",
      currency: "ARS",
      business_type: "reseller",
      timezone: "America/Argentina/Buenos_Aires",
      onboarding_completed: true,
      account_status: "active"
    });
    vi.mocked(catalog.getProducts).mockResolvedValue([]);
    vi.mocked(catalog.getRecipes).mockResolvedValue([]);
    vi.mocked(catalog.getProductionOrders).mockResolvedValue([]);

    render(await ProductionPage());

    expect(screen.getByText(/modulo no requerido para reventa/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("production-form")).not.toBeInTheDocument();
  });

  it("renders the production form for manufacturer accounts with recipes", async () => {
    const catalog = await import("@/server/queries/catalog");

    vi.mocked(catalog.getProfileData).mockResolvedValue({
      business_name: "Velas del Sur",
      currency: "ARS",
      business_type: "manufacturer",
      timezone: "America/Argentina/Buenos_Aires",
      onboarding_completed: true,
      account_status: "active"
    });
    vi.mocked(catalog.getProducts).mockResolvedValue([
      {
        id: "product-1",
        name: "Vela",
        description: null,
        sku: null,
        product_type: "manufactured",
        sale_unit: "unidad",
        default_sale_price: null,
        minimum_stock: null,
        active: true
      }
    ]);
    vi.mocked(catalog.getRecipes).mockResolvedValue([
      {
        id: "recipe-1",
        name: "Receta base",
        yield_quantity: 2,
        active: true,
        products: { id: "product-1", name: "Vela" },
        recipe_items: [{ quantity: 4, resources: { name: "Cera" } }]
      }
    ]);
    vi.mocked(catalog.getProductionOrders).mockResolvedValue([]);

    render(await ProductionPage());

    expect(screen.getByLabelText("production-form")).toBeInTheDocument();
    expect(screen.getByText(/descuenta insumos, calcula costo historico y aumenta stock/i)).toBeInTheDocument();
  });
});
