"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { accessRequestStatusSchema, accountStatusSchema, paymentSchema, planSchema, subscriptionSchema } from "@/lib/validation/admin";
import type { ActionResult } from "@/server/actions/auth";
import { requireAdminSession } from "@/lib/auth/session";

async function logAdminAudit(action: string, entityType: string, entityId: string | null, previousData: Record<string, unknown> | null, newData: Record<string, unknown> | null) {
  const { user, supabase } = await requireAdminSession();

  await supabase.from("admin_audit_logs").insert({
    admin_user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    previous_data: previousData,
    new_data: newData
  });
}

async function syncCommercialStateAfterPayment(userId: string, subscriptionId: string, paymentStatus: "pending" | "confirmed" | "rejected") {
  const { supabase } = await requireAdminSession();

  if (paymentStatus === "confirmed") {
    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        starts_at: new Date().toISOString().slice(0, 10)
      })
      .eq("id", subscriptionId);

    await supabase
      .from("profiles")
      .update({
        account_status: "active"
      })
      .eq("user_id", userId)
      .in("account_status", ["approved_pending_payment", "past_due"]);

    return;
  }

  if (paymentStatus === "rejected") {
    await supabase
      .from("subscriptions")
      .update({
        status: "past_due"
      })
      .eq("id", subscriptionId);

    await supabase
      .from("profiles")
      .update({
        account_status: "past_due"
      })
      .eq("user_id", userId)
      .eq("account_status", "approved_pending_payment");
  }
}

export async function updateAccessRequestStatus(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = accessRequestStatusSchema.safeParse({
    requestId: formData.get("requestId"),
    status: formData.get("status"),
    resolutionNotes: formData.get("resolutionNotes") ?? ""
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la solicitud." };
  }

  const { user } = await requireAdminSession();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("access_requests")
    .update({
      status: parsed.data.status,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_notes: parsed.data.resolutionNotes?.trim() || null
    })
    .eq("id", parsed.data.requestId);

  if (error) {
    return { success: false, message: "No pudimos actualizar la solicitud." };
  }

  await logAdminAudit("access_request_status_updated", "access_request", parsed.data.requestId, null, {
    status: parsed.data.status,
    resolution_notes: parsed.data.resolutionNotes?.trim() || null
  });

  revalidatePath("/admin");
  return { success: true, message: "Solicitud actualizada." };
}

export async function updateUserAccountStatus(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = accountStatusSchema.safeParse({
    userId: formData.get("userId"),
    accountStatus: formData.get("accountStatus")
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la cuenta." };
  }

  await requireAdminSession();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("profiles").update({ account_status: parsed.data.accountStatus }).eq("user_id", parsed.data.userId);

  if (error) {
    return { success: false, message: "No pudimos actualizar el estado de la cuenta." };
  }

  await logAdminAudit("account_status_updated", "profile", parsed.data.userId, null, {
    account_status: parsed.data.accountStatus
  });

  revalidatePath("/admin");
  return { success: true, message: "Estado de cuenta actualizado." };
}

export async function createPlan(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    currency: formData.get("currency"),
    billingPeriod: formData.get("billingPeriod")
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el plan." };
  }

  await requireAdminSession();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("plans").insert({
    name: parsed.data.name.trim(),
    description: parsed.data.description?.trim() || null,
    price: parsed.data.price,
    currency: parsed.data.currency.toUpperCase(),
    billing_period: parsed.data.billingPeriod.trim()
  });

  if (error) {
    return { success: false, message: "No pudimos crear el plan." };
  }

  await logAdminAudit("plan_created", "plan", null, null, {
    name: parsed.data.name.trim(),
    price: parsed.data.price,
    currency: parsed.data.currency.toUpperCase()
  });

  revalidatePath("/admin");
  return { success: true, message: "Plan creado." };
}

export async function createSubscription(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = subscriptionSchema.safeParse({
    userId: formData.get("userId"),
    planId: formData.get("planId"),
    status: formData.get("status"),
    startsAt: formData.get("startsAt") ?? "",
    endsAt: formData.get("endsAt") ?? "",
    nextBillingAt: formData.get("nextBillingAt") ?? ""
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la suscripcion." };
  }

  await requireAdminSession();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("subscriptions").insert({
    user_id: parsed.data.userId,
    plan_id: parsed.data.planId,
    status: parsed.data.status,
    starts_at: parsed.data.startsAt || null,
    ends_at: parsed.data.endsAt || null,
    next_billing_at: parsed.data.nextBillingAt || null
  });

  if (error) {
    return { success: false, message: "No pudimos crear la suscripcion." };
  }

  if (parsed.data.status === "active") {
    await supabase
      .from("profiles")
      .update({
        account_status: "approved_pending_payment"
      })
      .eq("user_id", parsed.data.userId)
      .eq("account_status", "pending");
  }

  await logAdminAudit("subscription_created", "subscription", null, null, {
    user_id: parsed.data.userId,
    plan_id: parsed.data.planId,
    status: parsed.data.status
  });

  revalidatePath("/admin");
  return { success: true, message: "Suscripcion creada." };
}

export async function createPayment(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = paymentSchema.safeParse({
    userId: formData.get("userId"),
    subscriptionId: formData.get("subscriptionId"),
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    status: formData.get("status"),
    paymentMethod: formData.get("paymentMethod") ?? "",
    externalReference: formData.get("externalReference") ?? ""
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el pago." };
  }

  await requireAdminSession();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("payments").insert({
    user_id: parsed.data.userId,
    subscription_id: parsed.data.subscriptionId,
    amount: parsed.data.amount,
    currency: parsed.data.currency.toUpperCase(),
    status: parsed.data.status,
    payment_method: parsed.data.paymentMethod?.trim() || null,
    external_reference: parsed.data.externalReference?.trim() || null,
    paid_at: parsed.data.status === "confirmed" ? new Date().toISOString() : null
  });

  if (error) {
    return { success: false, message: "No pudimos registrar el pago." };
  }

  await syncCommercialStateAfterPayment(parsed.data.userId, parsed.data.subscriptionId, parsed.data.status);

  await logAdminAudit("payment_created", "payment", null, null, {
    user_id: parsed.data.userId,
    subscription_id: parsed.data.subscriptionId,
    status: parsed.data.status,
    amount: parsed.data.amount
  });

  revalidatePath("/admin");
  return { success: true, message: "Pago registrado." };
}
