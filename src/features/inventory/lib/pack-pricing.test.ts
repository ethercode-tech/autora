import { describe, expect, it } from "vitest";
import { calculateIndividualUnitCost } from "@/features/inventory/lib/pack-pricing";

describe("calculateIndividualUnitCost", () => {
  it("calculates the price per individual unit", () => {
    expect(calculateIndividualUnitCost(1200, 6)).toBe(200);
  });

  it("rejects invalid pack quantity", () => {
    expect(() => calculateIndividualUnitCost(1200, 0)).toThrow("Pack quantity must be greater than zero.");
  });
});
