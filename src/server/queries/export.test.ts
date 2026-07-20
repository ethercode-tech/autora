import { describe, expect, it } from "vitest";
import { buildBusinessExportCsv, buildBusinessExportPayload } from "@/server/queries/export";

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

  it("builds a CSV export with stable headers and domain rows", () => {
    const payload = buildBusinessExportPayload(
      {
        profile: {
          business_name: "Velas del Sur",
          currency: "ARS",
          business_type: "manufacturer",
          timezone: "America/Argentina/Buenos_Aires",
          onboarding_completed: true,
          account_status: "active"
        },
        resources: [
          {
            id: "resource-1",
            name: "Cera",
            pack_quantity: 10,
            minimum_stock: 2,
            active: true,
            measurement_units: { name: "Unidad", symbol: "un" }
          }
        ],
        resourceStock: [{ id: "resource-1", name: "Cera", currentStock: 8, minimumStock: 2 }],
        products: [
          {
            id: "product-1",
            name: "Vela",
            description: null,
            sku: "VELA-01",
            product_type: "manufactured",
            sale_unit: "unidad",
            default_sale_price: 500,
            minimum_stock: 1,
            active: true
          }
        ],
        productStock: [{ id: "product-1", name: "Vela", currentStock: 4, minimumStock: 1 }],
        recipes: [
          {
            id: "recipe-1",
            name: "Receta base",
            yield_quantity: 2,
            active: true,
            products: { id: "product-1", name: "Vela" },
            recipe_items: [{ quantity: 4, resources: { name: "Cera" } }]
          }
        ],
        purchases: [{ id: "purchase-1", purchase_type: "resource", date: "2026-07-20", total: 1000, notes: "Compra inicial" }],
        consumptions: [{ id: "consumption-1", date: "2026-07-20", quantity: 2, notes: "Muestra", resources: { name: "Cera" } }],
        productionOrders: [
          {
            id: "production-1",
            date: "2026-07-20",
            quantity_produced: 4,
            total_cost: 800,
            unit_cost: 200,
            notes: "Lote 1",
            products: { name: "Vela" },
            recipes: { name: "Receta base" }
          }
        ],
        sales: [{ id: "sale-1", date: "2026-07-20", total: 900, notes: "Venta feria" }],
        financialMovements: [{ id: "fm-1", type: "income", amount: 900, date: "2026-07-20", description: "Venta registrada" }],
        pricingHistory: [
          {
            id: "pricing-1",
            created_at: "2026-07-20T12:00:00.000Z",
            cost: 200,
            profit_percentage: 150,
            suggested_price: 500,
            product_name_snapshot: "Vela"
          }
        ]
      },
      "2026-07-20T12:00:00.000Z"
    );

    const csv = buildBusinessExportCsv(payload);

    expect(csv).toContain("section,entity,id,name,date,status,quantity,amount,detail");
    expect(csv).toContain("metadata,export,,Velas del Sur,2026-07-20T12:00:00.000Z,active,,,currency=ARS;business_type=manufacturer;timezone=America/Argentina/Buenos_Aires");
    expect(csv).toContain("catalog,resource,resource-1,Cera,,active,2,,unit=un;pack_quantity=10");
    expect(csv).toContain("operations,sale,sale-1,sale,2026-07-20,,,900,Venta feria");
    expect(csv).toContain("pricing,pricing_calculation,pricing-1,Vela,2026-07-20T12:00:00.000Z,,150,500,cost=200");
  });
});
