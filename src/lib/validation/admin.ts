import { z } from "zod";

export const accessRequestStatusSchema = z.object({
  requestId: z.string().uuid("Solicitud invalida."),
  status: z.enum(["pending", "approved", "rejected"]),
  resolutionNotes: z.string().optional()
});

export const accountStatusSchema = z.object({
  userId: z.string().uuid("Cuenta invalida."),
  accountStatus: z.enum(["pending", "approved_pending_payment", "active", "past_due", "blocked", "rejected", "cancelled"])
});

export const planSchema = z.object({
  name: z.string().min(2, "Ingresa un nombre para el plan."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  currency: z.string().min(3).max(3),
  billingPeriod: z.string().min(3, "Ingresa el periodo de facturacion.")
});

export const subscriptionSchema = z.object({
  userId: z.string().uuid("Selecciona una cuenta valida."),
  planId: z.string().uuid("Selecciona un plan valido."),
  status: z.enum(["pending", "active", "past_due", "suspended", "cancelled"]),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  nextBillingAt: z.string().optional()
});

export const paymentSchema = z.object({
  subscriptionId: z.string().uuid("Selecciona una suscripcion valida."),
  amount: z.coerce.number().positive("El importe debe ser mayor a cero."),
  currency: z.string().min(3).max(3),
  status: z.enum(["pending", "confirmed", "rejected"]),
  paymentMethod: z.string().optional(),
  externalReference: z.string().optional()
});
