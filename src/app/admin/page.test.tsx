import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/admin/page";

vi.mock("@/components/layout/page-header", () => ({
  PageHeader: ({ title, description }: { title: string; description: string }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section>
}));

vi.mock("@/components/forms/admin-access-request-form", () => ({
  AdminAccessRequestForm: ({ request }: { request: { id: string } }) => <div>access-request-{request.id}</div>
}));

vi.mock("@/components/forms/admin-account-status-form", () => ({
  AdminAccountStatusForm: ({ profile }: { profile: { user_id: string } }) => <div>account-status-{profile.user_id}</div>
}));

vi.mock("@/components/forms/plan-form", () => ({
  PlanForm: () => <form aria-label="plan-form" />
}));

vi.mock("@/components/forms/subscription-form", () => ({
  SubscriptionForm: () => <form aria-label="subscription-form" />
}));

vi.mock("@/components/forms/payment-form", () => ({
  PaymentForm: () => <form aria-label="payment-form" />
}));

vi.mock("@/server/queries/catalog", () => ({
  getAccessRequests: vi.fn(),
  getAdminAuditLogs: vi.fn(),
  getAdminDashboardMetrics: vi.fn(),
  getAdminProfiles: vi.fn(),
  getPayments: vi.fn(),
  getPlans: vi.fn(),
  getSubscriptions: vi.fn()
}));

describe("AdminPage", () => {
  beforeEach(async () => {
    const catalog = await import("@/server/queries/catalog");

    vi.mocked(catalog.getAdminDashboardMetrics).mockResolvedValue({
      pendingRequests: 2,
      activeAccounts: 3,
      blockedAccounts: 1,
      registeredPayments: 4,
      activeSubscriptions: 2,
      recentRequests: [
        {
          id: "request-1",
          name: "Ana",
          email: "ana@autora.local",
          business_name: "Velas Ana",
          status: "pending",
          requested_at: "2026-07-20T00:00:00Z"
        }
      ]
    });
    vi.mocked(catalog.getAccessRequests).mockResolvedValue([
      {
        id: "request-1",
        name: "Ana",
        email: "ana@autora.local",
        business_name: "Velas Ana",
        status: "pending",
        requested_at: "2026-07-20T00:00:00Z"
      }
    ]);
    vi.mocked(catalog.getAdminProfiles).mockResolvedValue([
      {
        user_id: "profile-1",
        business_name: "Velas Ana",
        business_type: "manufacturer",
        account_status: "active",
        currency: "ARS"
      }
    ]);
    vi.mocked(catalog.getPlans).mockResolvedValue([
      {
        id: "plan-1",
        name: "Base",
        price: 15000,
        currency: "ARS",
        billing_period: "monthly",
        active: true
      }
    ]);
    vi.mocked(catalog.getSubscriptions).mockResolvedValue([
      {
        id: "subscription-1",
        user_id: "profile-1",
        status: "active",
        starts_at: "2026-07-20",
        next_billing_at: "2026-08-20",
        plans: { name: "Base" }
      }
    ]);
    vi.mocked(catalog.getPayments).mockResolvedValue([
      {
        id: "payment-1",
        user_id: "profile-1",
        amount: 15000,
        currency: "ARS",
        status: "confirmed",
        payment_method: "transfer",
        created_at: "2026-07-20T10:00:00Z"
      }
    ]);
    vi.mocked(catalog.getAdminAuditLogs).mockResolvedValue([
      {
        id: "audit-1",
        action: "payment_created",
        entity_type: "payment",
        entity_id: "payment-1",
        created_at: "2026-07-20T10:00:00Z"
      }
    ]);
  });

  it("renders the internal admin panel with commercial sections and recent data", async () => {
    render(await AdminPage());

    expect(screen.getByRole("heading", { name: "Panel interno" })).toBeInTheDocument();
    expect(screen.getByText(/solicitudes de acceso/i)).toBeInTheDocument();
    expect(screen.getByText(/estado de cuentas/i)).toBeInTheDocument();
    expect(screen.getByText(/nuevo plan/i)).toBeInTheDocument();
    expect(screen.getByText(/nueva suscripcion/i)).toBeInTheDocument();
    expect(screen.getByText(/nuevo pago/i)).toBeInTheDocument();
    expect(screen.getByText(/auditoria reciente/i)).toBeInTheDocument();
    expect(screen.getByText("access-request-request-1")).toBeInTheDocument();
    expect(screen.getByText("account-status-profile-1")).toBeInTheDocument();
    expect(screen.getByLabelText("plan-form")).toBeInTheDocument();
    expect(screen.getByLabelText("subscription-form")).toBeInTheDocument();
    expect(screen.getByLabelText("payment-form")).toBeInTheDocument();
    expect(screen.getByText("Base · 15000.00 ARS · monthly")).toBeInTheDocument();
    expect(screen.getByText("Base · active · profile-1")).toBeInTheDocument();
    expect(screen.getByText(/payment_created/i)).toBeInTheDocument();
  });
});
