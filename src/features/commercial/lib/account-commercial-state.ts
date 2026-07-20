import type { Database } from "@/types/database";

export type AccountStatus = Database["public"]["Tables"]["profiles"]["Row"]["account_status"];
export type SubscriptionStatus = "pending" | "active" | "past_due" | "suspended" | "cancelled";
export type PaymentStatus = "pending" | "confirmed" | "rejected";

type SubscriptionPatch = {
  status?: SubscriptionStatus;
  starts_at?: string | null;
};

type ProfilePatch = {
  account_status?: AccountStatus;
};

export function resolveProfileStatusAfterSubscriptionCreation(currentStatus: AccountStatus, subscriptionStatus: SubscriptionStatus) {
  if (subscriptionStatus === "active" && currentStatus === "pending") {
    return "approved_pending_payment" as const;
  }

  return currentStatus;
}

export function resolveProfilePatchAfterSubscriptionCreation(
  currentStatus: AccountStatus | null,
  subscriptionStatus: SubscriptionStatus
) {
  if (!currentStatus) {
    return null;
  }

  const nextStatus = resolveProfileStatusAfterSubscriptionCreation(currentStatus, subscriptionStatus);

  if (nextStatus === currentStatus) {
    return null;
  }

  return {
    currentStatus,
    patch: {
      account_status: nextStatus
    }
  };
}

export function resolveCommercialStateAfterPayment(params: {
  profileStatus: AccountStatus;
  paymentStatus: PaymentStatus;
  effectiveDate: string;
}) {
  const { profileStatus, paymentStatus, effectiveDate } = params;

  const subscriptionPatch: SubscriptionPatch = {};
  const profilePatch: ProfilePatch = {};

  if (paymentStatus === "confirmed") {
    subscriptionPatch.status = "active";
    subscriptionPatch.starts_at = effectiveDate;

    if (profileStatus === "approved_pending_payment" || profileStatus === "past_due") {
      profilePatch.account_status = "active";
    }
  }

  if (paymentStatus === "rejected") {
    subscriptionPatch.status = "past_due";

    if (profileStatus === "approved_pending_payment") {
      profilePatch.account_status = "past_due";
    }
  }

  return {
    subscriptionPatch,
    profilePatch
  };
}
