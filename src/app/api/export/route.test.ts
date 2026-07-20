import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/export/route";
import type { Database } from "@/types/database";
import type { User } from "@supabase/supabase-js";

vi.mock("@/lib/auth/session", () => ({
  requireActiveAccount: vi.fn()
}));

vi.mock("@/server/queries/export", () => ({
  buildBusinessExportCsv: vi.fn(),
  getBusinessExportPayload: vi.fn()
}));

describe("export route", () => {
  const activeProfile: Database["public"]["Tables"]["profiles"]["Row"] = {
    user_id: "user-1",
    business_name: "Velas del Sur",
    currency: "ARS",
    business_type: "manufacturer",
    account_status: "active",
    onboarding_completed: true,
    timezone: "America/Argentina/Buenos_Aires",
    created_at: "2026-07-20T10:00:00.000Z",
    updated_at: "2026-07-20T10:00:00.000Z"
  };

  const activeUser: User = {
    id: "user-1",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-07-20T10:00:00.000Z"
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a JSON attachment by default", async () => {
    const { requireActiveAccount } = await import("@/lib/auth/session");
    const { getBusinessExportPayload } = await import("@/server/queries/export");

    vi.mocked(requireActiveAccount).mockResolvedValue({
      user: activeUser,
      profile: activeProfile,
      supabase: {} as never
    });
    vi.mocked(getBusinessExportPayload).mockResolvedValue({
      generatedAt: "2026-07-20T12:00:00.000Z",
      profile: {
        business_name: "Velas del Sur",
        currency: "ARS",
        business_type: "manufacturer",
        timezone: "America/Argentina/Buenos_Aires",
        onboarding_completed: true,
        account_status: "active"
      },
      resources: [],
      resourceStock: [],
      products: [],
      productStock: [],
      recipes: [],
      purchases: [],
      consumptions: [],
      productionOrders: [],
      sales: [],
      financialMovements: [],
      pricingHistory: []
    });

    const response = await GET(new Request("https://autora.local/api/export"));

    expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="velas-del-sur-export.json"');
    await expect(response.json()).resolves.toMatchObject({
      generatedAt: "2026-07-20T12:00:00.000Z",
      profile: {
        business_name: "Velas del Sur"
      }
    });
  });

  it("returns a CSV attachment when format=csv", async () => {
    const { requireActiveAccount } = await import("@/lib/auth/session");
    const { buildBusinessExportCsv, getBusinessExportPayload } = await import("@/server/queries/export");

    vi.mocked(requireActiveAccount).mockResolvedValue({
      user: activeUser,
      profile: activeProfile,
      supabase: {} as never
    });
    vi.mocked(getBusinessExportPayload).mockResolvedValue({
      generatedAt: "2026-07-20T12:00:00.000Z",
      profile: {
        business_name: "Velas del Sur",
        currency: "ARS",
        business_type: "manufacturer",
        timezone: "America/Argentina/Buenos_Aires",
        onboarding_completed: true,
        account_status: "active"
      },
      resources: [],
      resourceStock: [],
      products: [],
      productStock: [],
      recipes: [],
      purchases: [],
      consumptions: [],
      productionOrders: [],
      sales: [],
      financialMovements: [],
      pricingHistory: []
    });
    vi.mocked(buildBusinessExportCsv).mockReturnValue("section,entity\nmetadata,export");

    const response = await GET(new Request("https://autora.local/api/export?format=csv"));

    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="velas-del-sur-export.csv"');
    await expect(response.text()).resolves.toBe("section,entity\nmetadata,export");
  });
});
