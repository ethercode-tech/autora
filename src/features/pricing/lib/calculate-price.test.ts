import { describe, expect, it } from "vitest";
import { calculateSuggestedPrice } from "@/features/pricing/lib/calculate-price";

describe("calculateSuggestedPrice", () => {
  it("calculates total cost, unit cost and suggested price", () => {
    const result = calculateSuggestedPrice(
      [
        { resourceId: "1", resourceName: "Cera", quantityUsed: 2, unitCost: 1000 },
        { resourceId: "2", resourceName: "Fragancia", quantityUsed: 1, unitCost: 500 }
      ],
      5,
      40
    );

    expect(result.totalCost).toBe(2500);
    expect(result.unitCost).toBe(500);
    expect(result.profitAmount).toBe(200);
    expect(result.suggestedPrice).toBe(700);
  });

  it("rejects invalid production quantity", () => {
    expect(() => calculateSuggestedPrice([], 0, 10)).toThrow("Produced units must be greater than zero.");
  });
});
