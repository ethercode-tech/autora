import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo valido."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres.")
});

export const accessRequestSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre."),
  email: z.string().email("Ingresa un correo valido."),
  businessName: z.string().min(2, "Ingresa el nombre de tu emprendimiento.")
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Ingresa un correo valido.")
});

export const controlledSignupSchema = z
  .object({
    email: z.string().email("Ingresa un correo valido."),
    password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(8, "Confirma la contrasena.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"]
  });

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(8, "Confirma la contrasena.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"]
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type AccessRequestInput = z.infer<typeof accessRequestSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type ControlledSignupInput = z.infer<typeof controlledSignupSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
