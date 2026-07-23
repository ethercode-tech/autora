import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/admin/page";

vi.mock("@/components/layout/page-header", () => ({
  PageHeader: ({ title, description }: { title: string; description: string }) => <header><h1>{title}</h1><p>{description}</p></header>
}));
vi.mock("@/components/ui/card", () => ({ Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section> }));
vi.mock("@/components/forms/admin-access-request-form", () => ({
  AdminAccessRequestForm: ({ request }: { request: { id: string } }) => <div>access-request-{request.id}</div>
}));
vi.mock("@/components/forms/admin-account-status-form", () => ({
  AdminAccountStatusForm: ({ profile }: { profile: { user_id: string } }) => <div>account-status-{profile.user_id}</div>
}));
vi.mock("@/server/queries/catalog", () => ({ getAccessRequests: vi.fn(), getAdminProfiles: vi.fn() }));

describe("AdminPage", () => {
  beforeEach(async () => {
    const catalog = await import("@/server/queries/catalog");
    vi.mocked(catalog.getAccessRequests).mockResolvedValue([{ id: "request-1", name: "Ana", email: "ana@autora.local", business_name: "Velas Ana", status: "pending", requested_at: "2026-07-20T00:00:00Z" }]);
    vi.mocked(catalog.getAdminProfiles).mockResolvedValue([{ user_id: "profile-1", business_name: "Velas Ana", business_type: "manufacturer", account_status: "active", currency: "ARS" }]);
  });

  it("renders only the MVP access and account administration sections", async () => {
    render(await AdminPage());
    expect(screen.getByRole("heading", { name: "Cuentas AUTORA" })).toBeInTheDocument();
    expect(screen.getByText(/solicitudes de acceso/i)).toBeInTheDocument();
    expect(screen.getByText(/usuarios registrados/i)).toBeInTheDocument();
    expect(screen.getByText("access-request-request-1")).toBeInTheDocument();
    expect(screen.getByText("account-status-profile-1")).toBeInTheDocument();
  });
});
