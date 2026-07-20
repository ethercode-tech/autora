import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecipeForm } from "@/components/forms/recipe-form";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: () => [{ success: false, message: "" }, "/recipes", false]
  };
});

vi.mock("@/server/actions/production", () => ({
  createRecipe: vi.fn()
}));

describe("RecipeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds and removes multiple ingredient rows while keeping at least one", () => {
    render(
      <RecipeForm
        products={[
          {
            id: "product-1",
            name: "Vela",
            description: null,
            sku: null,
            product_type: "manufactured",
            sale_unit: "unidad",
            default_sale_price: 500,
            minimum_stock: 1,
            active: true
          }
        ]}
        resources={[
          {
            id: "resource-1",
            name: "Cera",
            pack_quantity: null,
            minimum_stock: null,
            active: true,
            measurement_units: null
          },
          {
            id: "resource-2",
            name: "Mecha",
            pack_quantity: null,
            minimum_stock: null,
            active: true,
            measurement_units: null
          }
        ]}
      />
    );

    expect(screen.getAllByText("Selecciona un recurso")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: /agregar insumo/i }));

    expect(screen.getAllByText("Selecciona un recurso")).toHaveLength(2);

    const removeButtons = screen.getAllByRole("button", { name: /quitar/i });
    fireEvent.click(removeButtons[1]);

    expect(screen.getAllByText("Selecciona un recurso")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /quitar/i })).toBeDisabled();
  });
});
