import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const initialMigration = readFileSync(
  join(process.cwd(), "supabase", "migrations", "202607200001_initial_schema.sql"),
  "utf8"
);

describe("RLS migration coverage", () => {
  it("enables row level security on core operational tables", () => {
    const requiredTables = [
      "profiles",
      "resources",
      "products",
      "recipes",
      "purchases",
      "resource_consumptions",
      "production_orders",
      "sales",
      "inventory_movements",
      "financial_movements",
      "subscriptions",
      "payments",
      "admin_audit_logs"
    ];

    for (const table of requiredTables) {
      expect(initialMigration).toContain(`alter table public.${table} enable row level security;`);
    }
  });

  it("declares owner and admin policies required by the SaaS boundary", () => {
    const requiredPolicies = [
      'create policy "profiles_owner_select" on public.profiles',
      'create policy "profiles_owner_insert" on public.profiles',
      'create policy "profiles_owner_update" on public.profiles',
      'create policy "resources_owner_all" on public.resources',
      'create policy "products_owner_all" on public.products',
      'create policy "production_orders_owner_all" on public.production_orders',
      'create policy "sales_owner_all" on public.sales',
      'create policy "inventory_movements_owner_all" on public.inventory_movements',
      'create policy "admin_users_admin_only" on public.admin_users',
      'create policy "admin_audit_logs_admin_only" on public.admin_audit_logs'
    ];

    for (const policy of requiredPolicies) {
      expect(initialMigration).toContain(policy);
    }
  });
});
