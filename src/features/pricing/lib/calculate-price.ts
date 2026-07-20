export type PricingLine = {
  resourceId: string;
  resourceName: string;
  quantityUsed: number;
  unitCost: number;
};

export type PricingCalculation = {
  totalCost: number;
  unitCost: number;
  profitAmount: number;
  suggestedPrice: number;
};

export function calculateSuggestedPrice(lines: PricingLine[], producedUnits: number, markupPercentage: number): PricingCalculation {
  if (producedUnits <= 0) {
    throw new Error("Produced units must be greater than zero.");
  }

  if (markupPercentage < 0) {
    throw new Error("Markup percentage cannot be negative.");
  }

  const totalCost = lines.reduce((sum, line) => sum + line.quantityUsed * line.unitCost, 0);
  const unitCost = totalCost / producedUnits;
  const profitAmount = unitCost * (markupPercentage / 100);

  return {
    totalCost,
    unitCost,
    profitAmount,
    suggestedPrice: unitCost + profitAmount
  };
}
