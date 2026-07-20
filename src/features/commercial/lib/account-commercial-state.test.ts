import { describe, expect, it } from "vitest";
import {
  resolveCommercialStateAfterPayment,
  resolveProfilePatchAfterSubscriptionCreation,
  resolveProfileStatusAfterSubscriptionCreation
} from "@/features/commercial/lib/account-commercial-state";

describe("resolveProfileStatusAfterSubscriptionCreation", () => {
  it("moves a pending account to approved pending payment when the subscription starts active", () => {
    expect(resolveProfileStatusAfterSubscriptionCreation("pending", "active")).toBe("approved_pending_payment");
  });

  it("keeps other statuses unchanged", () => {
    expect(resolveProfileStatusAfterSubscriptionCreation("blocked", "active")).toBe("blocked");
    expect(resolveProfileStatusAfterSubscriptionCreation("pending", "pending")).toBe("pending");
  });
});

describe("resolveCommercialStateAfterPayment", () => {
  it("activates the subscription and account after a confirmed payment", () => {
    const result = resolveCommercialStateAfterPayment({
      profileStatus: "approved_pending_payment",
      paymentStatus: "confirmed",
      effectiveDate: "2026-07-20"
    });

    expect(result.subscriptionPatch).toEqual({
      status: "active",
      starts_at: "2026-07-20"
    });
    expect(result.profilePatch).toEqual({
      account_status: "active"
    });
  });

  it("reactivates a past due account after a confirmed payment", () => {
    const result = resolveCommercialStateAfterPayment({
      profileStatus: "past_due",
      paymentStatus: "confirmed",
      effectiveDate: "2026-07-20"
    });

    expect(result.subscriptionPatch.status).toBe("active");
    expect(result.profilePatch.account_status).toBe("active");
  });

  it("moves only approved pending payment accounts to past due on rejected payment", () => {
    const rejectedPending = resolveCommercialStateAfterPayment({
      profileStatus: "approved_pending_payment",
      paymentStatus: "rejected",
      effectiveDate: "2026-07-20"
    });
    const rejectedActive = resolveCommercialStateAfterPayment({
      profileStatus: "active",
      paymentStatus: "rejected",
      effectiveDate: "2026-07-20"
    });

    expect(rejectedPending.subscriptionPatch.status).toBe("past_due");
    expect(rejectedPending.profilePatch.account_status).toBe("past_due");
    expect(rejectedActive.subscriptionPatch.status).toBe("past_due");
    expect(rejectedActive.profilePatch).toEqual({});
  });

  it("does not mutate commercial state for pending payment records", () => {
    const result = resolveCommercialStateAfterPayment({
      profileStatus: "approved_pending_payment",
      paymentStatus: "pending",
      effectiveDate: "2026-07-20"
    });

    expect(result.subscriptionPatch).toEqual({});
    expect(result.profilePatch).toEqual({});
  });
});

describe("resolveProfilePatchAfterSubscriptionCreation", () => {
  it("returns a guarded patch only when the profile must move forward", () => {
    expect(resolveProfilePatchAfterSubscriptionCreation("pending", "active")).toEqual({
      currentStatus: "pending",
      patch: {
        account_status: "approved_pending_payment"
      }
    });
  });

  it("returns null when the current profile is already in a non-promotable state or missing", () => {
    expect(resolveProfilePatchAfterSubscriptionCreation("blocked", "active")).toBeNull();
    expect(resolveProfilePatchAfterSubscriptionCreation("active", "active")).toBeNull();
    expect(resolveProfilePatchAfterSubscriptionCreation(null, "active")).toBeNull();
  });
});
