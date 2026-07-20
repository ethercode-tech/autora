import { describe, expect, it } from "vitest";
import { buildBusinessExportPayload } from "@/server/queries/export";

describe("buildBusinessExportPayload", () => {
  it("returns a stable snapshot envelope", () => {
    const payload = buildBusinessExportPayload(
      {
        profile: null,
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
      },
      "2026-07-20T12:00:00.000Z"
    );

    expect(payload.generatedAt).toBe("2026-07-20T12:00:00.000Z");
    expect(payload.profile).toBeNull();
    expect(payload.sales).toEqual([]);
  });
});
