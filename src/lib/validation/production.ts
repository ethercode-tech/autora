import { z } from "zod";

export const productionSchema = z.object({
  productId: z.string().uuid("Selecciona un producto valido."),
  recipeId: z.string().uuid("Selecciona una receta valida."),
  quantity: z.coerce.number().positive("La cantidad a producir debe ser mayor a cero."),
  date: z.string().min(1, "Ingresa una fecha."),
  notes: z.string().optional()
});

export type ProductionInput = z.infer<typeof productionSchema>;
