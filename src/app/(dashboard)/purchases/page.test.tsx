import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PurchasesPage from "@/app/(dashboard)/purchases/page";

vi.mock("@/components/layout/page-header", () => ({ PageHeader: ({ title, description }: { title: string; description: string }) => <header><h1>{title}</h1><p>{description}</p></header> }));
vi.mock("@/components/ui/card", () => ({ Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section> }));
vi.mock("@/components/feedback/empty-state", () => ({ EmptyState: ({ title, description }: { title: string; description: string }) => <div><p>{title}</p><p>{description}</p></div> }));
vi.mock("@/components/forms/purchase-form", () => ({ PurchaseForm: () => <form aria-label="purchase-form" /> }));
vi.mock("@/server/queries/catalog", () => ({ getPurchases: vi.fn(), getResources: vi.fn() }));

describe("PurchasesPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows purchases only for resources", async () => {
    const catalog = await import("@/server/queries/catalog");
    vi.mocked(catalog.getResources).mockResolvedValue([{ id: "resource-1", name: "Cera", pack_quantity: null, minimum_stock: null, active: true, measurement_units: null }]);
    vi.mocked(catalog.getPurchases).mockResolvedValue([]);
    render(await PurchasesPage());
    expect(screen.getByRole("heading", { name: /compras/i })).toBeInTheDocument();
    expect(screen.getByText(/aumenta el stock del recurso/i)).toBeInTheDocument();
    expect(screen.getByLabelText("purchase-form")).toBeInTheDocument();
  });

  it("shows an empty-state hint until there are resources", async () => {
    const catalog = await import("@/server/queries/catalog");
    vi.mocked(catalog.getResources).mockResolvedValue([]);
    vi.mocked(catalog.getPurchases).mockResolvedValue([]);
    render(await PurchasesPage());
    expect(screen.getByText(/primero necesitas cargar un recurso/i)).toBeInTheDocument();
  });
});
