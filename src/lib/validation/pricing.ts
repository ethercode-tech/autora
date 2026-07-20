import { z } from "zod";

export const pricingCalculationSchema = z.object({
  recipeId: z.string().uuid("Selecciona una receta valida."),
  producedQuantity: z.coerce.number().positive("La cantidad producida debe ser mayor a cero."),
  profitPercentage: z.coerce.number().min(0, "El porcentaje no puede ser negativo.")
});

export const savePricingCalculationSchema = pricingCalculationSchema.extend({
  productId: z.string().uuid("Selecciona un producto valido.")
});

export type PricingCalculationInput = z.infer<typeof pricingCalculationSchema>;
export type SavePricingCalculationInput = z.infer<typeof savePricingCalculationSchema>;
