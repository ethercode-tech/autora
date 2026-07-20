import { describe, expect, it } from "vitest";
import { buildAdminDashboardMetrics } from "@/features/admin/lib/build-admin-dashboard-metrics";

describe("buildAdminDashboardMetrics", () => {
  it("aggregates the key commercial counts for the admin dashboard", () => {
    const metrics = buildAdminDashboardMetrics({
      requests: [
        { id: "r1", name: "Ana", email: "ana@example.com", business_name: "Velas Sur", status: "pending", requested_at: "2026-07-20" },
        { id: "r2", name: "Lu", email: "lu@example.com", business_name: "Difusores Norte", status: "approved", requested_at: "2026-07-19" }
      ],
      profiles: [
        { user_id: "u1", business_name: "Velas Sur", business_type: "manufacturer", account_status: "active", currency: "ARS" },
        { user_id: "u2", business_name: "Difusores Norte", business_type: "reseller", account_status: "blocked", currency: "ARS" },
        { user_id: "u3", business_name: "Aromas Centro", business_type: "manufacturer", account_status: "past_due", currency: "ARS" }
      ],
      subscriptions: [
        { id: "s1", user_id: "u1", status: "active", starts_at: "2026-07-01", next_billing_at: "2026-08-01", plans: { name: "Base" } },
        { id: "s2", user_id: "u2", status: "past_due", starts_at: "2026-06-01", next_billing_at: "2026-07-01", plans: { name: "Pro" } }
      ],
      payments: [
        { id: "p1", user_id: "u1", amount: 10000, currency: "ARS", status: "confirmed", payment_method: "transferencia", created_at: "2026-07-01" },
        { id: "p2", user_id: "u2", amount: 12000, currency: "ARS", status: "rejected", payment_method: "efectivo", created_at: "2026-07-10" }
      ]
    });

    expect(metrics.pendingRequests).toBe(1);
    expect(metrics.activeAccounts).toBe(1);
    expect(metrics.blockedAccounts).toBe(1);
    expect(metrics.activeSubscriptions).toBe(1);
    expect(metrics.registeredPayments).toBe(2);
  });

  it("limits recent requests to the first ten items already ordered by the query layer", () => {
    const requests = Array.from({ length: 12 }, (_, index) => ({
      id: `request-${index}`,
      name: `Cuenta ${index}`,
      email: `cuenta-${index}@example.com`,
      business_name: `Negocio ${index}`,
      status: index % 2 === 0 ? "pending" : "approved",
      requested_at: `2026-07-${String(index + 1).padStart(2, "0")}`
    }));

    const metrics = buildAdminDashboardMetrics({
      requests,
      profiles: [],
      subscriptions: [],
      payments: []
    });

    expect(metrics.recentRequests).toHaveLength(10);
    expect(metrics.recentRequests[0]?.id).toBe("request-0");
  });
});
