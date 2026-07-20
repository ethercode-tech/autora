import type { SubscriptionRow } from "@/server/queries/catalog";

export function resolveSubscriptionUserId(subscriptions: SubscriptionRow[], subscriptionId: string) {
  if (!subscriptionId) {
    return "";
  }

  return subscriptions.find((subscription) => subscription.id === subscriptionId)?.user_id ?? "";
}
