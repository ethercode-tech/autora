import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PricingPage from "@/app/(dashboard)/pricing/page";

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

vi.mock("@/components/forms/pricing-form", () => ({
  PricingForm: () => <form aria-label="pricing-form" />
}));

vi.mock("@/server/queries/catalog", () => ({
  getPricingHistory: vi.fn(),
  getProducts: vi.fn(),
  getProfileData: vi.fn(),
  getRecipes: vi.fn()
}));

describe("PricingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks the calculator for reseller accounts", async () => {
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
    vi.mocked(catalog.getPricingHistory).mockResolvedValue([]);

    render(await PricingPage());

    expect(screen.getByText(/modulo no requerido para reventa/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("pricing-form")).not.toBeInTheDocument();
  });

  it("renders the calculator for manufacturer accounts with recipes", async () => {
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
    vi.mocked(catalog.getPricingHistory).mockResolvedValue([]);

    render(await PricingPage());

    expect(screen.getByLabelText("pricing-form")).toBeInTheDocument();
    expect(screen.getByText(/calcula costo unitario, recargo y precio sugerido/i)).toBeInTheDocument();
  });
});
