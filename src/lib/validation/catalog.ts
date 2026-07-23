import { z } from "zod";

export const measurementUnitSchema = z.object({
  name: z.string().min(1, "Ingresa un nombre para la unidad."),
  symbol: z.string().min(1, "Ingresa un simbolo corto.")
});

export const resourceSchema = z.object({
  name: z.string().min(2, "Ingresa un nombre para el recurso."),
  measurementUnitId: z.string().uuid("Selecciona una unidad valida."),
  packQuantity: z.coerce.number().positive("La cantidad por envase debe ser mayor a cero."),
  minimumStock: z.coerce.number().min(0, "El stock minimo no puede ser negativo.").optional()
});

export const productSchema = z.object({
  name: z.string().min(2, "Ingresa un nombre para el producto."),
  description: z.string().optional(),
  sku: z.string().optional(),
  productType: z.enum(["manufactured", "resale"]),
  saleUnit: z.string().min(1, "Ingresa la unidad de venta."),
  defaultSalePrice: z.coerce.number().min(0, "El precio no puede ser negativo.").optional(),
  minimumStock: z.coerce.number().min(0, "El stock minimo no puede ser negativo.").optional()
});

export const recipeSchema = z.object({
  productId: z.string().uuid("Selecciona un producto valido."),
  name: z.string().min(2, "Ingresa un nombre para la receta."),
  yieldQuantity: z.coerce.number().positive("El rendimiento debe ser mayor a cero."),
  items: z
    .array(
      z.object({
        resourceId: z.string().uuid("Selecciona un recurso valido."),
        quantity: z.coerce.number().positive("La cantidad del recurso debe ser mayor a cero.")
      })
    )
    .min(1, "Agrega al menos un insumo a la receta.")
});

export function buildRecipeInputFromFormData(formData: FormData) {
  const resourceIds = formData.getAll("resourceId[]");
  const quantities = formData.getAll("quantity[]");
  const items = resourceIds.map((resourceId, index) => ({
    resourceId,
    quantity: quantities[index] ?? ""
  }));

  return {
    productId: formData.get("productId"),
    name: formData.get("name"),
    yieldQuantity: formData.get("yieldQuantity"),
    items
  };
}

export type MeasurementUnitInput = z.infer<typeof measurementUnitSchema>;
export type ResourceInput = z.infer<typeof resourceSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type RecipeInput = z.infer<typeof recipeSchema>;
