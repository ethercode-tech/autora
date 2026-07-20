import { z } from "zod";

export const resourceConsumptionSchema = z.object({
  resourceId: z.string().uuid("Selecciona un recurso valido."),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a cero."),
  date: z.string().min(1, "Ingresa una fecha."),
  notes: z.string().optional()
});

export type ResourceConsumptionInput = z.infer<typeof resourceConsumptionSchema>;
