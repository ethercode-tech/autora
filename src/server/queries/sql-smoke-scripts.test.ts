import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const operationalFlowSmoke = readFileSync(
  join(process.cwd(), "tests", "integration", "operational-flow-smoke.sql"),
  "utf8"
);
const multiuserRlsSmoke = readFileSync(
  join(process.cwd(), "tests", "rls", "multiuser-smoke.sql"),
  "utf8"
);

describe("SQL smoke scripts", () => {
  it("keeps an executable operational flow smoke with inventory and blocking assertions", () => {
    const requiredOperationalChecks = [
      "public.register_purchase(",
      "public.register_resource_consumption(",
      "public.register_production(",
      "public.register_sale(",
      "UNEXPECTED_RESOURCE_STOCK_AFTER_PURCHASE",
      "UNEXPECTED_PRODUCT_STOCK_AFTER_SALE",
      "FAILED_SALE_WAS_NOT_ROLLED_BACK",
      "ACCOUNT_NOT_ACTIVE",
      "rollback;"
    ];

    for (const snippet of requiredOperationalChecks) {
      expect(operationalFlowSmoke).toContain(snippet);
    }
  });

  it("keeps a multiuser RLS smoke with cross-account read and write checks", () => {
    const requiredRlsChecks = [
      "TWO_ACTIVE_PROFILES_REQUIRED",
      "RLS_LEAK_ON_SELECT",
      "EXPECTED_RLS_INSERT_REJECTION",
      "RLS_LEAK_ON_UPDATE",
      "set local role authenticated;",
      "rollback;"
    ];

    for (const snippet of requiredRlsChecks) {
      expect(multiuserRlsSmoke).toContain(snippet);
    }
  });
});
