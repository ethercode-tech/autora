import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const initialMigration = readFileSync(
  join(process.cwd(), "supabase", "migrations", "202607200001_initial_schema.sql"),
  "utf8"
);
const productionCostsMigration = readFileSync(
  join(process.cwd(), "supabase", "migrations", "202607200003_production_costs.sql"),
  "utf8"
);
const adminCommercialRlsMigration = readFileSync(
  join(process.cwd(), "supabase", "migrations", "202607200004_admin_commercial_rls.sql"),
  "utf8"
);
const isAdminRecursionFixMigration = readFileSync(
  join(process.cwd(), "supabase", "migrations", "202607200005_fix_is_admin_recursion.sql"),
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

  it("protects inventory flows from going negative at the database layer", () => {
    const guardedExceptions = [
      "raise exception 'INSUFFICIENT_PRODUCT_STOCK';",
      "raise exception 'INSUFFICIENT_RESOURCE_STOCK';"
    ];

    for (const guardedException of guardedExceptions) {
      expect(initialMigration).toContain(guardedException);
    }

    expect(initialMigration).toContain("if public.product_stock(item_product_id) < item_quantity then");
    expect(initialMigration).toContain(
      "if adjustment_entity_type = 'resource' and public.resource_stock(adjustment_resource_id) + adjustment_quantity < 0 then"
    );
    expect(initialMigration).toContain(
      "if adjustment_entity_type = 'product' and public.product_stock(adjustment_product_id) + adjustment_quantity < 0 then"
    );
    expect(productionCostsMigration).toContain(
      "if public.resource_stock(recipe_item.resource_id) < resource_needed then"
    );
  });

  it("persists financial movements for purchases and sales", () => {
    expect(initialMigration).toContain(
      "insert into public.financial_movements (user_id, type, amount, date, description, source_type, source_id)"
    );
    expect(initialMigration).toContain(
      "values (auth.uid(), 'expense', purchase_total, purchase_date, 'Compra registrada', 'purchase', purchase_id);"
    );
    expect(initialMigration).toContain(
      "values (auth.uid(), 'income', sale_total, sale_date, 'Venta registrada', 'sale', sale_id);"
    );
  });

  it("persists production costs and product ingress in the cost-aware migration", () => {
    const requiredSnippets = [
      "raise exception 'MISSING_RESOURCE_COST';",
      "production_total_cost numeric(12, 2) := 0;",
      "line_total_cost := round((resource_needed * latest_unit_cost)::numeric, 2);",
      "insert into public.production_items (user_id, production_order_id, resource_id, quantity_used, unit_cost, total_cost)",
      "total_cost = production_total_cost,",
      "unit_cost = round((production_total_cost / nullif(production_quantity, 0))::numeric, 2)",
      "'production_product_in',"
    ];

    for (const snippet of requiredSnippets) {
      expect(productionCostsMigration).toContain(snippet);
    }
  });

  it("grants admin write access required by the commercial cycle", () => {
    expect(adminCommercialRlsMigration).toContain('create policy "subscriptions_admin_write"');
    expect(adminCommercialRlsMigration).toContain("on public.subscriptions");
    expect(adminCommercialRlsMigration).toContain('create policy "payments_admin_write"');
    expect(adminCommercialRlsMigration).toContain("on public.payments");
    expect(adminCommercialRlsMigration).toContain("using (public.is_admin())");
    expect(adminCommercialRlsMigration).toContain("with check (public.is_admin())");
  });

  it("defines is_admin as a security definer helper to avoid recursive admin RLS checks", () => {
    expect(isAdminRecursionFixMigration).toContain("create or replace function public.is_admin()");
    expect(isAdminRecursionFixMigration).toContain("security definer");
    expect(isAdminRecursionFixMigration).toContain("set search_path = public");
    expect(isAdminRecursionFixMigration).toContain("from public.admin_users");
  });
});
