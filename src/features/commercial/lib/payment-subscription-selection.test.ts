import { describe, expect, it } from "vitest";
import { resolveSubscriptionUserId } from "@/features/commercial/lib/payment-subscription-selection";

describe("payment subscription selection", () => {
  const subscriptions = [
    {
      id: "subscription-a",
      user_id: "user-a",
      status: "active",
      starts_at: "2026-07-20",
      next_billing_at: "2026-08-20",
      plans: { name: "Base" }
    },
    {
      id: "subscription-b",
      user_id: "user-b",
      status: "pending",
      starts_at: null,
      next_billing_at: null,
      plans: { name: "Pro" }
    }
  ] as const;

  it("returns the account user id for the selected subscription", () => {
    expect(resolveSubscriptionUserId([...subscriptions], "subscription-b")).toBe("user-b");
  });

  it("returns an empty string when the selection is empty or unknown", () => {
    expect(resolveSubscriptionUserId([...subscriptions], "")).toBe("");
    expect(resolveSubscriptionUserId([...subscriptions], "missing")).toBe("");
  });
});
