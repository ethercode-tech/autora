import { describe, expect, it } from "vitest";
import { buildRecipeInputFromFormData, recipeSchema } from "@/lib/validation/catalog";

describe("recipe form parsing", () => {
  it("builds a recipe input with multiple resource items from FormData", () => {
    const formData = new FormData();
    formData.set("productId", "11111111-1111-1111-1111-111111111111");
    formData.set("name", "Receta base");
    formData.set("yieldQuantity", "12");
    formData.append("resourceId[]", "22222222-2222-2222-2222-222222222222");
    formData.append("resourceId[]", "33333333-3333-3333-3333-333333333333");
    formData.append("quantity[]", "4");
    formData.append("quantity[]", "1.5");

    expect(buildRecipeInputFromFormData(formData)).toEqual({
      productId: "11111111-1111-1111-1111-111111111111",
      name: "Receta base",
      yieldQuantity: "12",
      items: [
        {
          resourceId: "22222222-2222-2222-2222-222222222222",
          quantity: "4"
        },
        {
          resourceId: "33333333-3333-3333-3333-333333333333",
          quantity: "1.5"
        }
      ]
    });
  });

  it("requires at least one valid recipe item", () => {
    const parsed = recipeSchema.safeParse({
      productId: "11111111-1111-1111-1111-111111111111",
      name: "Receta base",
      yieldQuantity: "12",
      items: []
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe("Agrega al menos un insumo a la receta.");
  });
});
