import { describe, expect, it } from "vitest";
import { formatConsumptionError, formatProductionError, formatPurchaseOrSaleError } from "@/features/operations/lib/operation-feedback";

describe("formatPurchaseOrSaleError", () => {
  it("maps known purchase and sale errors to user-friendly feedback", () => {
    expect(formatPurchaseOrSaleError("EMPTY_PURCHASE")).toBe("La compra necesita al menos un item.");
    expect(formatPurchaseOrSaleError("INVALID_PURCHASE_ITEM")).toBe("La compra tiene cantidades o precios invalidos.");
    expect(formatPurchaseOrSaleError("EMPTY_SALE")).toBe("La venta necesita al menos un item.");
    expect(formatPurchaseOrSaleError("INVALID_SALE_ITEM")).toBe("La venta tiene cantidades o precios invalidos.");
    expect(formatPurchaseOrSaleError("INSUFFICIENT_PRODUCT_STOCK")).toBe("No hay stock suficiente para registrar la venta.");
  });

  it("falls back to a generic operation error", () => {
    expect(formatPurchaseOrSaleError("SOMETHING_ELSE")).toBe("No pudimos registrar la operacion.");
    expect(formatPurchaseOrSaleError(null)).toBe("No pudimos registrar la operacion.");
  });
});

describe("formatConsumptionError", () => {
  it("maps consumption failures to clear messages", () => {
    expect(formatConsumptionError("ACCOUNT_NOT_ACTIVE")).toBe("La cuenta debe estar activa para registrar consumos.");
    expect(formatConsumptionError("INVALID_CONSUMPTION_QUANTITY")).toBe("La cantidad consumida debe ser mayor a cero.");
    expect(formatConsumptionError("INSUFFICIENT_RESOURCE_STOCK")).toBe("No hay stock suficiente para registrar este consumo.");
  });

  it("falls back to a generic consumption error", () => {
    expect(formatConsumptionError("UNKNOWN")).toBe("No pudimos registrar el consumo.");
  });
});

describe("formatProductionError", () => {
  it("maps production failures to clear messages", () => {
    expect(formatProductionError("ACCOUNT_NOT_ACTIVE")).toBe("La cuenta debe estar activa para producir.");
    expect(formatProductionError("INVALID_PRODUCTION_QUANTITY")).toBe("La cantidad a producir debe ser mayor a cero.");
    expect(formatProductionError("INSUFFICIENT_RESOURCE_STOCK")).toBe("No hay insumos suficientes para registrar la produccion.");
    expect(formatProductionError("MISSING_RESOURCE_COST")).toBe("Falta costo historico de al menos un insumo. Registra compras antes de producir.");
  });

  it("falls back to a generic production error", () => {
    expect(formatProductionError("UNKNOWN")).toBe("No pudimos registrar la produccion.");
  });
});
