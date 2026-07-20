"use server";

import { revalidatePath } from "next/cache";
import { resolveCommercialStateAfterPayment, resolveProfilePatchAfterSubscriptionCreation } from "@/features/commercial/lib/account-commercial-state";
import { writeStructuredLog } from "@/lib/observability/structured-log";
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
  const { data: profile } = await supabase.from("profiles").select("account_status").eq("user_id", userId).maybeSingle();

  if (!profile) {
    return;
  }

  const transitions = resolveCommercialStateAfterPayment({
    profileStatus: profile.account_status,
    paymentStatus,
    effectiveDate: new Date().toISOString().slice(0, 10)
  });

  if (Object.keys(transitions.subscriptionPatch).length > 0) {
    await supabase
      .from("subscriptions")
      .update(transitions.subscriptionPatch)
      .eq("id", subscriptionId);
  }

  if (Object.keys(transitions.profilePatch).length > 0) {
    await supabase
      .from("profiles")
      .update(transitions.profilePatch)
      .eq("user_id", userId)
      .eq("account_status", profile.account_status);
  }
}

export async function updateAccessRequestStatus(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = accessRequestStatusSchema.safeParse({
    requestId: formData.get("requestId"),
    status: formData.get("status"),
    resolutionNotes: formData.get("resolutionNotes") ?? ""
  });

  if (!parsed.success) {
    writeStructuredLog("warn", "admin.access_request.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
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
    writeStructuredLog("error", "admin.access_request.persist_failed", {
      message: error.message,
      requestId: parsed.data.requestId
    });
    return { success: false, message: "No pudimos actualizar la solicitud." };
  }

  await logAdminAudit("access_request_status_updated", "access_request", parsed.data.requestId, null, {
    status: parsed.data.status,
    resolution_notes: parsed.data.resolutionNotes?.trim() || null
  });

  revalidatePath("/admin");
  writeStructuredLog("info", "admin.access_request.updated", {
    requestId: parsed.data.requestId,
    status: parsed.data.status
  });
  return { success: true, message: "Solicitud actualizada." };
}

export async function updateUserAccountStatus(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = accountStatusSchema.safeParse({
    userId: formData.get("userId"),
    accountStatus: formData.get("accountStatus")
  });

  if (!parsed.success) {
    writeStructuredLog("warn", "admin.account_status.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la cuenta." };
  }

  await requireAdminSession();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("profiles").update({ account_status: parsed.data.accountStatus }).eq("user_id", parsed.data.userId);

  if (error) {
    writeStructuredLog("error", "admin.account_status.persist_failed", {
      message: error.message,
      userId: parsed.data.userId
    });
    return { success: false, message: "No pudimos actualizar el estado de la cuenta." };
  }

  await logAdminAudit("account_status_updated", "profile", parsed.data.userId, null, {
    account_status: parsed.data.accountStatus
  });

  revalidatePath("/admin");
  writeStructuredLog("info", "admin.account_status.updated", {
    userId: parsed.data.userId,
    accountStatus: parsed.data.accountStatus
  });
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
    writeStructuredLog("warn", "admin.plan.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
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
    writeStructuredLog("error", "admin.plan.persist_failed", {
      message: error.message,
      name: parsed.data.name
    });
    return { success: false, message: "No pudimos crear el plan." };
  }

  await logAdminAudit("plan_created", "plan", null, null, {
    name: parsed.data.name.trim(),
    price: parsed.data.price,
    currency: parsed.data.currency.toUpperCase()
  });

  revalidatePath("/admin");
  writeStructuredLog("info", "admin.plan.created", {
    name: parsed.data.name.trim(),
    currency: parsed.data.currency.toUpperCase()
  });
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
    writeStructuredLog("warn", "admin.subscription.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar la suscripcion." };
  }

  await requireAdminSession();
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileLookupError } =
    parsed.data.status === "active"
      ? await supabase.from("profiles").select("account_status").eq("user_id", parsed.data.userId).maybeSingle()
      : { data: null, error: null };

  if (profileLookupError) {
    writeStructuredLog("error", "admin.subscription.profile_lookup_failed", {
      message: profileLookupError.message,
      userId: parsed.data.userId
    });
    return { success: false, message: "No pudimos resolver el estado actual de la cuenta." };
  }

  const { error } = await supabase.from("subscriptions").insert({
    user_id: parsed.data.userId,
    plan_id: parsed.data.planId,
    status: parsed.data.status,
    starts_at: parsed.data.startsAt || null,
    ends_at: parsed.data.endsAt || null,
    next_billing_at: parsed.data.nextBillingAt || null
  });

  if (error) {
    writeStructuredLog("error", "admin.subscription.persist_failed", {
      message: error.message,
      userId: parsed.data.userId,
      planId: parsed.data.planId
    });
    return { success: false, message: "No pudimos crear la suscripcion." };
  }

  const profileTransition = resolveProfilePatchAfterSubscriptionCreation(profile?.account_status ?? null, parsed.data.status);

  if (profileTransition) {
    await supabase
      .from("profiles")
      .update(profileTransition.patch)
      .eq("user_id", parsed.data.userId)
      .eq("account_status", profileTransition.currentStatus);
  }

  await logAdminAudit("subscription_created", "subscription", null, null, {
    user_id: parsed.data.userId,
    plan_id: parsed.data.planId,
    status: parsed.data.status
  });

  revalidatePath("/admin");
  writeStructuredLog("info", "admin.subscription.created", {
    userId: parsed.data.userId,
    planId: parsed.data.planId,
    status: parsed.data.status
  });
  return { success: true, message: "Suscripcion creada." };
}

export async function createPayment(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = paymentSchema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    status: formData.get("status"),
    paymentMethod: formData.get("paymentMethod") ?? "",
    externalReference: formData.get("externalReference") ?? ""
  });

  if (!parsed.success) {
    writeStructuredLog("warn", "admin.payment.validation_failed", {
      issue: parsed.error.issues[0]?.message ?? "unknown"
    });
    return { success: false, message: parsed.error.issues[0]?.message ?? "No pudimos validar el pago." };
  }

  await requireAdminSession();
  const supabase = await createSupabaseServerClient();
  const { data: subscription, error: subscriptionLookupError } = await supabase
    .from("subscriptions")
    .select("id, user_id")
    .eq("id", parsed.data.subscriptionId)
    .maybeSingle();

  if (subscriptionLookupError || !subscription) {
    writeStructuredLog("error", "admin.payment.subscription_lookup_failed", {
      message: subscriptionLookupError?.message ?? "missing subscription",
      subscriptionId: parsed.data.subscriptionId
    });
    return { success: false, message: "No pudimos resolver la cuenta asociada a la suscripcion." };
  }

  const { error } = await supabase.from("payments").insert({
    user_id: subscription.user_id,
    subscription_id: parsed.data.subscriptionId,
    amount: parsed.data.amount,
    currency: parsed.data.currency.toUpperCase(),
    status: parsed.data.status,
    payment_method: parsed.data.paymentMethod?.trim() || null,
    external_reference: parsed.data.externalReference?.trim() || null,
    paid_at: parsed.data.status === "confirmed" ? new Date().toISOString() : null
  });

  if (error) {
    writeStructuredLog("error", "admin.payment.persist_failed", {
      message: error.message,
      userId: subscription.user_id,
      subscriptionId: parsed.data.subscriptionId
    });
    return { success: false, message: "No pudimos registrar el pago." };
  }

  await syncCommercialStateAfterPayment(subscription.user_id, parsed.data.subscriptionId, parsed.data.status);

  await logAdminAudit("payment_created", "payment", null, null, {
    user_id: subscription.user_id,
    subscription_id: parsed.data.subscriptionId,
    status: parsed.data.status,
    amount: parsed.data.amount
  });

  revalidatePath("/admin");
  writeStructuredLog("info", "admin.payment.created", {
    userId: subscription.user_id,
    subscriptionId: parsed.data.subscriptionId,
    status: parsed.data.status
  });
  return { success: true, message: "Pago registrado." };
}
