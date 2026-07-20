"use server";

import { redirect } from "next/navigation";
import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { accessRequestSchema, changePasswordSchema, controlledSignupSchema, loginSchema, passwordResetRequestSchema } from "@/lib/validation/auth";
import type { Database } from "@/types/database";

export type ActionResult = {
  success: boolean;
  message: string;
};

export async function submitAccessRequest(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = accessRequestSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    businessName: formData.get("businessName")
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la solicitud." };
  }

  const payload: Database["public"]["Tables"]["access_requests"]["Insert"] = {
    name: parsed.data.name,
    email: parsed.data.email,
    business_name: parsed.data.businessName
  };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("access_requests").insert([payload]);

  if (error) {
    return { success: false, message: "No pudimos registrar la solicitud. Revisa si el correo ya fue usado." };
  }

  return { success: true, message: "Solicitud enviada. Te avisaremos cuando sea revisada." };
}

export async function signInWithPassword(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el ingreso." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, message: "No pudimos iniciar sesion con esas credenciales." };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el correo." };
  }

  const supabase = await createSupabaseServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/reset-password`
  });

  if (error) {
    return { success: false, message: "No pudimos iniciar la recuperacion en este momento." };
  }

  return {
    success: true,
    message: "Si el correo existe, enviamos un enlace para redefinir la contrasena."
  };
}

export async function updatePassword(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la nueva contrasena." };
  }

  const { supabase, user } = await requireUserSession();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password
  });

  if (error) {
    return { success: false, message: "No pudimos actualizar la contrasena." };
  }

  const actorLabel = user.email ? ` para ${user.email}` : "";

  return { success: true, message: `Contrasena actualizada${actorLabel}.` };
}

export async function registerApprovedAccount(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = controlledSignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el alta." };
  }

  const adminClient = createSupabaseAdminClient();
  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const { data: accessRequest, error: requestError } = await adminClient
    .from("access_requests")
    .select("id, business_name, status")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (requestError || !accessRequest) {
    return { success: false, message: "No encontramos una solicitud aprobada para ese correo." };
  }

  if (accessRequest.status !== "approved") {
    return { success: false, message: "Tu solicitud todavia no esta aprobada para crear la cuenta." };
  }

  const userResult = await adminClient.auth.admin.createUser({
    email: normalizedEmail,
    password: parsed.data.password,
    email_confirm: true
  });

  if (userResult.error || !userResult.data.user) {
    return { success: false, message: "No pudimos crear la cuenta. Revisa si el correo ya esta registrado." };
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    user_id: userResult.data.user.id,
    business_name: accessRequest.business_name,
    account_status: "approved_pending_payment",
    onboarding_completed: false
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(userResult.data.user.id);
    return { success: false, message: "No pudimos inicializar el perfil de la cuenta." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: parsed.data.password
  });

  if (signInError) {
    return { success: true, message: "Cuenta creada. Ya puedes iniciar sesion." };
  }

  redirect("/account-status");
}
