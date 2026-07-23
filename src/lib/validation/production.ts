import { z } from "zod";

export const productionSchema = z.object({
  productId: z.string().uuid("Selecciona un producto valido."),
  quantity: z.coerce.number().positive("La cantidad a producir debe ser mayor a cero."),
  date: z.string().min(1, "Ingresa una fecha."),
  note: z.string().max(500, "La nota no puede superar los 500 caracteres.").optional()
});

export type ProductionInput = z.infer<typeof productionSchema>;
