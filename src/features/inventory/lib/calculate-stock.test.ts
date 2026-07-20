import { describe, expect, it } from "vitest";
import { calculateStock, getLowStockState } from "@/features/inventory/lib/calculate-stock";

describe("calculateStock", () => {
  it("sums signed inventory movements", () => {
    expect(calculateStock([{ quantitySigned: 10 }, { quantitySigned: -3 }, { quantitySigned: -2 }])).toBe(5);
  });
});

describe("getLowStockState", () => {
  it("returns out when stock is zero or negative", () => {
    expect(getLowStockState(0, 3)).toBe("out");
  });

  it("returns low when stock is under or equal to minimum", () => {
    expect(getLowStockState(2, 3)).toBe("low");
  });

  it("returns normal when stock is above minimum", () => {
    expect(getLowStockState(5, 3)).toBe("normal");
  });
});
