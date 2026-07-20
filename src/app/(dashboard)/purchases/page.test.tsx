import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PurchasesPage from "@/app/(dashboard)/purchases/page";

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

vi.mock("@/components/forms/purchase-form", () => ({
  PurchaseForm: () => <form aria-label="purchase-form" />
}));

vi.mock("@/server/queries/catalog", () => ({
  getProducts: vi.fn(),
  getProfileData: vi.fn(),
  getPurchases: vi.fn(),
  getResources: vi.fn()
}));

describe("PurchasesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("explains reseller purchases as product stock ingress", async () => {
    const catalog = await import("@/server/queries/catalog");

    vi.mocked(catalog.getProfileData).mockResolvedValue({
      business_name: "Reventa Sur",
      currency: "ARS",
      business_type: "reseller",
      timezone: "America/Argentina/Buenos_Aires",
      onboarding_completed: true,
      account_status: "active"
    });
    vi.mocked(catalog.getResources).mockResolvedValue([]);
    vi.mocked(catalog.getProducts).mockResolvedValue([
      {
        id: "product-1",
        name: "Vela importada",
        description: null,
        sku: null,
        product_type: "resale",
        sale_unit: "unidad",
        default_sale_price: null,
        minimum_stock: null,
        active: true
      }
    ]);
    vi.mocked(catalog.getPurchases).mockResolvedValue([]);

    render(await PurchasesPage());

    expect(screen.getByRole("heading", { name: /compras/i })).toBeInTheDocument();
    expect(screen.getByText(/las compras ingresan stock de productos/i)).toBeInTheDocument();
    expect(screen.getByLabelText("purchase-form")).toBeInTheDocument();
  });

  it("explains manufacturer purchases as resource stock ingress", async () => {
    const catalog = await import("@/server/queries/catalog");

    vi.mocked(catalog.getProfileData).mockResolvedValue({
      business_name: "Velas del Sur",
      currency: "ARS",
      business_type: "manufacturer",
      timezone: "America/Argentina/Buenos_Aires",
      onboarding_completed: true,
      account_status: "active"
    });
    vi.mocked(catalog.getResources).mockResolvedValue([
      {
        id: "resource-1",
        name: "Cera",
        pack_quantity: null,
        minimum_stock: null,
        active: true,
        measurement_units: null
      }
    ]);
    vi.mocked(catalog.getProducts).mockResolvedValue([]);
    vi.mocked(catalog.getPurchases).mockResolvedValue([]);

    render(await PurchasesPage());

    expect(screen.getByText(/las compras ingresan stock de recursos/i)).toBeInTheDocument();
    expect(screen.getByLabelText("purchase-form")).toBeInTheDocument();
  });
});
