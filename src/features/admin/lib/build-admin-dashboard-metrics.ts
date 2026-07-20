import type { AccessRequestRow, AdminProfileRow, PaymentRow, SubscriptionRow } from "@/server/queries/catalog";

export type AdminDashboardMetrics = {
  pendingRequests: number;
  activeAccounts: number;
  blockedAccounts: number;
  activeSubscriptions: number;
  registeredPayments: number;
  recentRequests: AccessRequestRow[];
};

export function buildAdminDashboardMetrics(params: {
  requests: AccessRequestRow[];
  profiles: AdminProfileRow[];
  subscriptions: SubscriptionRow[];
  payments: PaymentRow[];
}): AdminDashboardMetrics {
  const { requests, profiles, subscriptions, payments } = params;

  return {
    pendingRequests: requests.filter((request) => request.status === "pending").length,
    activeAccounts: profiles.filter((profile) => profile.account_status === "active").length,
    blockedAccounts: profiles.filter((profile) => profile.account_status === "blocked").length,
    activeSubscriptions: subscriptions.filter((subscription) => subscription.status === "active").length,
    registeredPayments: payments.length,
    recentRequests: requests.slice(0, 10)
  };
}
