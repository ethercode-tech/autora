import { z } from "zod";

export const pricingResourceLineSchema = z.object({
  resourceId: z.string().uuid("Selecciona un recurso valido."),
  quantity: z.coerce.number().positive("La cantidad usada debe ser mayor a cero.")
});

export const pricingCalculationSchema = z.object({
  profitPercentage: z.coerce.number().min(0, "El porcentaje no puede ser negativo.")
});

export const savePricingCalculationSchema = pricingCalculationSchema.extend({
  productId: z.string().uuid("Selecciona un producto valido."),
  resourceLines: z.array(pricingResourceLineSchema).min(1, "Agrega al menos un recurso.")
});

export type PricingCalculationInput = z.infer<typeof pricingCalculationSchema>;
export type SavePricingCalculationInput = z.infer<typeof savePricingCalculationSchema>;
