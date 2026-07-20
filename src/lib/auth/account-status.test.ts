import { describe, expect, it } from "vitest";
import { getAccountStatusHelp, getAccountStatusLabel, isOperationalAccountStatus } from "@/lib/auth/account-status";

describe("account status rules", () => {
  it("allows only active accounts to operate", () => {
    expect(isOperationalAccountStatus("active")).toBe(true);
    expect(isOperationalAccountStatus("pending")).toBe(false);
    expect(isOperationalAccountStatus("past_due")).toBe(false);
    expect(isOperationalAccountStatus("blocked")).toBe(false);
    expect(isOperationalAccountStatus(null)).toBe(false);
  });

  it("returns user-facing labels and help text", () => {
    expect(getAccountStatusLabel("approved_pending_payment")).toBe("Aprobada, pendiente de pago");
    expect(getAccountStatusHelp("past_due")).toContain("vencida");
    expect(getAccountStatusLabel(undefined)).toBe("Sin estado");
  });
});
