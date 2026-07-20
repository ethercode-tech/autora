export function formatPurchaseOrSaleError(message: string | null) {
  switch (message) {
    case "ACCOUNT_NOT_ACTIVE":
      return "La cuenta debe estar activa para operar.";
    case "EMPTY_PURCHASE":
      return "La compra necesita al menos un item.";
    case "INVALID_PURCHASE_ITEM":
      return "La compra tiene cantidades o precios invalidos.";
    case "EMPTY_SALE":
      return "La venta necesita al menos un item.";
    case "INVALID_SALE_ITEM":
      return "La venta tiene cantidades o precios invalidos.";
    case "INSUFFICIENT_PRODUCT_STOCK":
      return "No hay stock suficiente para registrar la venta.";
    default:
      return "No pudimos registrar la operacion.";
  }
}

export function formatConsumptionError(message: string | null) {
  switch (message) {
    case "ACCOUNT_NOT_ACTIVE":
      return "La cuenta debe estar activa para registrar consumos.";
    case "INVALID_CONSUMPTION_QUANTITY":
      return "La cantidad consumida debe ser mayor a cero.";
    case "INSUFFICIENT_RESOURCE_STOCK":
      return "No hay stock suficiente para registrar este consumo.";
    default:
      return "No pudimos registrar el consumo.";
  }
}

export function formatProductionError(message: string | null) {
  switch (message) {
    case "ACCOUNT_NOT_ACTIVE":
      return "La cuenta debe estar activa para producir.";
    case "INVALID_PRODUCTION_QUANTITY":
      return "La cantidad a producir debe ser mayor a cero.";
    case "INSUFFICIENT_RESOURCE_STOCK":
      return "No hay insumos suficientes para registrar la produccion.";
    case "MISSING_RESOURCE_COST":
      return "Falta costo historico de al menos un insumo. Registra compras antes de producir.";
    default:
      return "No pudimos registrar la produccion.";
  }
}
