export type InventoryMovement = {
  quantitySigned: number;
};

export function calculateStock(movements: InventoryMovement[]) {
  return movements.reduce((sum, movement) => sum + movement.quantitySigned, 0);
}

export function getLowStockState(stock: number, minimumStock: number | null) {
  if (minimumStock === null) {
    return "normal" as const;
  }

  if (stock <= 0) {
    return "out" as const;
  }

  if (stock <= minimumStock) {
    return "low" as const;
  }

  return "normal" as const;
}
