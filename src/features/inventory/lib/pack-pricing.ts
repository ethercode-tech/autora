export function calculateIndividualUnitCost(totalPrice: number, packQuantity: number) {
  if (totalPrice <= 0) {
    throw new Error("Total price must be greater than zero.");
  }

  if (packQuantity <= 0) {
    throw new Error("Pack quantity must be greater than zero.");
  }

  return totalPrice / packQuantity;
}
