import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ConsumptionsPage from "@/app/(dashboard)/consumptions/page";

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

vi.mock("@/components/feedback/empty-state", () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div>
      <p>{title}</p>
      <p>{description}</p>
    </div>
  )
}));

vi.mock("@/components/forms/consumption-form", () => ({
  ConsumptionForm: () => <form aria-label="consumption-form" />
}));

vi.mock("@/server/queries/catalog", () => ({
  getProfileData: vi.fn(),
  getResourceConsumptions: vi.fn(),
  getResources: vi.fn()
}));

describe("ConsumptionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks the module for reseller accounts", async () => {
    const catalog = await import("@/server/queries/catalog");

    vi.mocked(catalog.getProfileData).mockResolvedValue({
      business_name: "Reventa Sur",
      currency: "ARS",
      business_type: "reseller",
      timezone: "America/Argentina/Buenos_Aires",
      onboarding_completed: true,
      account_status: "active"
    });
    vi.mocked(catalog.getResources).mockResolvedValue([]);
    vi.mocked(catalog.getResourceConsumptions).mockResolvedValue([]);

    render(await ConsumptionsPage());

    expect(screen.getByText(/modulo no requerido para reventa/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("consumption-form")).not.toBeInTheDocument();
  });

  it("renders the consumption form and history for manufacturer accounts", async () => {
    const catalog = await import("@/server/queries/catalog");

    vi.mocked(catalog.getProfileData).mockResolvedValue({
      business_name: "Velas del Sur",
      currency: "ARS",
      business_type: "manufacturer",
      timezone: "America/Argentina/Buenos_Aires",
      onboarding_completed: true,
      account_status: "active"
    });
    vi.mocked(catalog.getResources).mockResolvedValue([
      {
        id: "resource-1",
        name: "Cera",
        pack_quantity: null,
        minimum_stock: null,
        active: true,
        measurement_units: null
      }
    ]);
    vi.mocked(catalog.getResourceConsumptions).mockResolvedValue([
      {
        id: "consumption-1",
        date: "2026-07-20",
        quantity: 2,
        notes: "Prueba de mecha",
        resources: { name: "Cera" }
      }
    ]);

    render(await ConsumptionsPage());

    expect(screen.getByLabelText("consumption-form")).toBeInTheDocument();
    expect(screen.getByText(/perdidas, pruebas, desperdicios/i)).toBeInTheDocument();
    expect(screen.getByText(/Cera - 2026-07-20/)).toBeInTheDocument();
    expect(screen.getByText("Prueba de mecha")).toBeInTheDocument();
  });
});
