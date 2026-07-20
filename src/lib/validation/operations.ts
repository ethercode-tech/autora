import { z } from "zod";

export const purchaseSchema = z.object({
  itemId: z.string().uuid("Selecciona un item valido."),
  purchaseType: z.enum(["resource", "product"]),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a cero."),
  unitPrice: z.coerce.number().positive("El precio unitario debe ser mayor a cero."),
  date: z.string().min(1, "Ingresa una fecha."),
  notes: z.string().optional()
});

export const saleSchema = z.object({
  productId: z.string().uuid("Selecciona un producto valido."),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a cero."),
  unitPrice: z.coerce.number().min(0, "El precio no puede ser negativo."),
  date: z.string().min(1, "Ingresa una fecha."),
  notes: z.string().optional()
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
