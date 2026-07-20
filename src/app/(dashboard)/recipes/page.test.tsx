import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecipesPage from "@/app/(dashboard)/recipes/page";

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

vi.mock("@/components/forms/recipe-form", () => ({
  RecipeForm: () => <form aria-label="recipe-form" />
}));

vi.mock("@/server/queries/catalog", () => ({
  getProducts: vi.fn(),
  getProfileData: vi.fn(),
  getRecipes: vi.fn(),
  getResources: vi.fn()
}));

describe("RecipesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the module as not required for reseller accounts", async () => {
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
    vi.mocked(catalog.getResources).mockResolvedValue([]);
    vi.mocked(catalog.getRecipes).mockResolvedValue([]);

    render(await RecipesPage());

    expect(screen.getByRole("heading", { name: /recetas/i })).toBeInTheDocument();
    expect(screen.getByText(/modulo no requerido para reventa/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("recipe-form")).not.toBeInTheDocument();
  });

  it("renders the recipe form and multi-input messaging for manufacturer accounts", async () => {
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

    render(await RecipesPage());

    expect(screen.getByLabelText("recipe-form")).toBeInTheDocument();
    expect(screen.getByText(/todos los insumos necesarios en una sola receta/i)).toBeInTheDocument();
    expect(screen.getByText("Receta base")).toBeInTheDocument();
    expect(screen.getByText(/Cera: 4\.000/)).toBeInTheDocument();
  });
});
