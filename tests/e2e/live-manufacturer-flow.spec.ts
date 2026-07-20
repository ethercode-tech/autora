import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const isLiveE2EEnabled = process.env.E2E_LIVE_SUPABASE === "1";
const envFromFile = loadEnvFile();
const requiredEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? envFromFile.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? envFromFile.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? envFromFile.SUPABASE_SERVICE_ROLE_KEY
};

type NumericRow = {
  current_stock?: number | string | null;
  minimum_stock?: number | string | null;
  total_cost?: number | string | null;
  unit_cost?: number | string | null;
  total?: number | string | null;
  type?: string | null;
  amount?: number | string | null;
};

function loadEnvFile() {
  const envFilePath = path.resolve(process.cwd(), ".env");

  if (!existsSync(envFilePath)) {
    return {} as Record<string, string>;
  }

  const entries = readFileSync(envFilePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => {
      const separatorIndex = line.indexOf("=");

      if (separatorIndex === -1) {
        return null;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      return [key, value] as const;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  return Object.fromEntries(entries);
}

function createAdminClient(): SupabaseClient<Database> {
  if (!requiredEnv.url || !requiredEnv.serviceRoleKey) {
    throw new Error("Missing live Supabase environment for Playwright live tests.");
  }

  return createClient<Database>(requiredEnv.url, requiredEnv.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

function createUserClient() {
  if (!requiredEnv.url || !requiredEnv.anonKey) {
    throw new Error("Missing anon Supabase environment for Playwright live tests.");
  }

  return createClient<Database>(requiredEnv.url, requiredEnv.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

async function findUserIdByEmail(adminClient: SupabaseClient<Database>, email: string) {
  const { data, error } = await adminClient.auth.admin.listUsers();

  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
}

async function cleanupLiveArtifacts(adminClient: SupabaseClient<Database>, email: string) {
  const userId = await findUserIdByEmail(adminClient, email);

  if (userId) {
    try {
      await adminClient.auth.admin.deleteUser(userId);
    } catch {
      // Cleanup should not mask the test result.
    }
  }

  try {
    await adminClient.from("access_requests").delete().eq("email", email.toLowerCase());
  } catch {
    // Cleanup should not mask the test result.
  }
}

test.describe("live manufacturer flow", () => {
  test.skip(!isLiveE2EEnabled, "Set E2E_LIVE_SUPABASE=1 to run the persistent end-to-end flow against real Supabase.");

  test("creates an approved account and completes the manufacturer flow with real persistence", async ({ page }) => {
    const adminClient = createAdminClient();
    const identity = randomUUID().slice(0, 8);
    const email = `playwright-live-${Date.now()}-${identity}@autora.local`;
    const password = `Autora!${randomUUID().slice(0, 12)}`;
    const businessName = `Autora Live ${identity}`;
    const resourceName = `Cera ${identity}`;
    const productName = `Vela ${identity}`;
    const recipeName = `Receta ${identity}`;
    const purchaseNotes = `purchase-${identity}`;
    const productionNotes = `production-${identity}`;
    const saleNotes = `sale-${identity}`;
    let userId: string | null = null;

    await cleanupLiveArtifacts(adminClient, email);

    try {
      await page.goto("/request-access");
      await page.getByLabel("Nombre").fill("Playwright Live");
      await page.getByLabel("Correo").fill(email);
      await page.getByLabel("Emprendimiento").fill(businessName);
      await page.getByRole("button", { name: /solicitar acceso/i }).click();

      await expect(page.getByText(/solicitud enviada/i)).toBeVisible();

      await expect
        .poll(async () => {
          const { data } = await adminClient.from("access_requests").select("status").eq("email", email).maybeSingle();
          return data?.status ?? null;
        })
        .toBe("pending");

      const { error: approveRequestError } = await adminClient
        .from("access_requests")
        .update({
          status: "approved",
          resolved_at: new Date().toISOString(),
          resolution_notes: `approved-${identity}`
        })
        .eq("email", email);

      expect(approveRequestError).toBeNull();

      await page.goto("/register");
      await page.getByLabel("Correo aprobado").fill(email);
      await page.locator('input[name="password"]').fill(password);
      await page.locator('input[name="confirmPassword"]').fill(password);
      await page.getByRole("button", { name: /crear cuenta/i }).click();

      await expect(page).toHaveURL(/\/account-status$/);
      await expect(page.getByRole("heading", { name: /cuenta todavia no puede operar/i })).toBeVisible();
      await expect(page.getByText(/pendiente/i)).toBeVisible();

      await expect
        .poll(async () => {
          userId = await findUserIdByEmail(adminClient, email);
          return userId;
        })
        .not.toBeNull();

      const { error: activateProfileError } = await adminClient
        .from("profiles")
        .update({
          account_status: "active",
          business_type: "manufacturer",
          currency: "ARS",
          timezone: "America/Argentina/Buenos_Aires"
        })
        .eq("user_id", userId!);

      expect(activateProfileError).toBeNull();

      await page.goto("/settings");
      await expect(page.getByRole("heading", { name: /configuracion/i })).toBeVisible();

      await page.getByPlaceholder("Nombre del emprendimiento").fill(`${businessName} Operativo`);
      await page.getByPlaceholder("Moneda").fill("ARS");
      await page.locator('select[name="businessType"]').selectOption("manufacturer");
      await page.getByPlaceholder("Zona horaria").fill("America/Argentina/Buenos_Aires");
      await page.getByRole("button", { name: /guardar configuracion/i }).click();
      await expect(page.getByText(/configuracion actualizada/i)).toBeVisible();

      await page.getByPlaceholder("Unidad").fill("Unidad");
      await page.getByPlaceholder("kg, un, ml").fill("un");
      await page.getByRole("button", { name: /agregar unidad/i }).click();
      await expect(page.getByText(/unidad creada/i)).toBeVisible();
      await expect(page.getByText(/unidad \(un\)/i)).toBeVisible();

      await page.goto("/resources");
      await page.getByPlaceholder("Nombre del recurso").fill(resourceName);
      await page.locator('select[name="measurementUnitId"]').selectOption({ label: "Unidad (un)" });
      await page.getByPlaceholder("Stock minimo (opcional)").fill("3");
      await page.getByRole("button", { name: /crear recurso/i }).click();
      await expect(page.getByText(/recurso creado/i)).toBeVisible();
      await expect(page.getByText(resourceName)).toBeVisible();

      await page.goto("/products");
      await page.getByPlaceholder("Nombre del producto").fill(productName);
      await page.locator('select[name="productType"]').selectOption("manufactured");
      await page.getByPlaceholder("Unidad de venta").fill("unidad");
      await page.getByPlaceholder("Precio base (opcional)").fill("300");
      await page.getByPlaceholder("Stock minimo (opcional)").fill("1");
      await page.getByRole("button", { name: /crear producto/i }).click();
      await expect(page.getByText(/producto creado/i)).toBeVisible();
      await expect(page.getByText(productName)).toBeVisible();

      await page.goto("/recipes");
      await page.locator('select[name="productId"]').selectOption({ label: productName });
      await page.getByPlaceholder("Nombre de la receta").fill(recipeName);
      await page.getByPlaceholder("Rendimiento total").fill("2");
      await page.locator('select[name="resourceId[]"]').selectOption({ label: resourceName });
      await page.getByPlaceholder("Cantidad del insumo 1").fill("4");
      await page.getByRole("button", { name: /crear receta/i }).click();
      await expect(page.getByText(/receta creada/i)).toBeVisible();
      await expect(page.getByText(recipeName)).toBeVisible();

      await page.goto("/purchases");
      await page.locator('select[name="itemId"]').selectOption({ label: resourceName });
      await page.getByPlaceholder("Cantidad").fill("10");
      await page.getByPlaceholder("Precio unitario").fill("100");
      await page.getByPlaceholder("Nota opcional").fill(purchaseNotes);
      await page.getByRole("button", { name: /registrar compra/i }).click();
      await expect(page.getByText(/compra registrada/i)).toBeVisible();
      await expect(page.getByText(purchaseNotes)).toBeVisible();

      await page.goto("/production");
      await page.locator('select[name="productId"]').selectOption({ label: productName });
      await page.locator('select[name="recipeId"]').selectOption({ label: recipeName });
      await page.getByPlaceholder("Cantidad a producir").fill("2");
      await page.getByPlaceholder("Nota opcional").fill(productionNotes);
      await page.getByRole("button", { name: /registrar produccion/i }).click();
      await expect(page.getByText(/produccion registrada/i)).toBeVisible();
      await expect(page.getByText(productionNotes)).toBeVisible();

      await page.goto("/sales");
      await page.locator('select[name="productId"]').selectOption({ label: productName });
      await page.getByPlaceholder("Cantidad").fill("1");
      await page.getByPlaceholder("Precio unitario").fill("300");
      await page.getByPlaceholder("Nota opcional").fill(saleNotes);
      await page.getByRole("button", { name: /registrar venta/i }).click();
      await expect(page.getByText(/venta registrada/i)).toBeVisible();
      await expect(page.getByText(saleNotes)).toBeVisible();

      await page.goto("/dashboard");
      await expect(page.getByRole("heading", { name: /tu negocio, en un solo vistazo/i })).toBeVisible();
      const dashboardKpis = page.locator("section").first();
      await expect(dashboardKpis.getByText("300.00").first()).toBeVisible();
      await expect(dashboardKpis.getByText("1000.00").first()).toBeVisible();
      await expect(dashboardKpis.getByText("-700.00").first()).toBeVisible();
      await expect(page.getByText(/revisar/i)).toBeVisible();
      await expect(page.getByText(saleNotes)).toBeVisible();

      const userClient = createUserClient();
      const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
        email,
        password
      });

      expect(signInError).toBeNull();
      expect(signInData.user?.id).toBeTruthy();

      const resourceStockResponse = await userClient
        .from("resource_stock_view")
        .select("current_stock, minimum_stock")
        .eq("user_id", signInData.user!.id);
      const productStockResponse = await userClient
        .from("product_stock_view")
        .select("current_stock, minimum_stock")
        .eq("user_id", signInData.user!.id);
      const productionResponse = await userClient
        .from("production_orders")
        .select("total_cost, unit_cost, notes")
        .eq("user_id", signInData.user!.id)
        .eq("notes", productionNotes);
      const saleResponse = await userClient
        .from("sales")
        .select("total, notes")
        .eq("user_id", signInData.user!.id)
        .eq("notes", saleNotes);
      const financialResponse = await userClient
        .from("financial_movements")
        .select("type, amount, description")
        .eq("user_id", signInData.user!.id);

      const resourceStockRows = (resourceStockResponse.data ?? []) as Array<Required<Pick<NumericRow, "current_stock" | "minimum_stock">>>;
      const productStockRows = (productStockResponse.data ?? []) as Array<Required<Pick<NumericRow, "current_stock" | "minimum_stock">>>;
      const productionRows = (productionResponse.data ?? []) as Array<Required<Pick<NumericRow, "total_cost" | "unit_cost">> & { notes: string | null }>;
      const saleRows = (saleResponse.data ?? []) as Array<Required<Pick<NumericRow, "total">> & { notes: string | null }>;
      const financialRows = (financialResponse.data ?? []) as Array<Required<Pick<NumericRow, "type" | "amount">> & { description: string | null }>;

      expect(Number(resourceStockRows?.[0]?.current_stock ?? 0)).toBe(6);
      expect(Number(resourceStockRows?.[0]?.minimum_stock ?? 0)).toBe(3);
      expect(Number(productStockRows?.[0]?.current_stock ?? 0)).toBe(1);
      expect(Number(productStockRows?.[0]?.minimum_stock ?? 0)).toBe(1);
      expect(Number(productionRows?.[0]?.total_cost ?? 0)).toBe(400);
      expect(Number(productionRows?.[0]?.unit_cost ?? 0)).toBe(200);
      expect(Number(saleRows?.[0]?.total ?? 0)).toBe(300);
      expect(financialRows?.some((row: Required<Pick<NumericRow, "type" | "amount">>) => row.type === "expense" && Number(row.amount) === 1000)).toBe(true);
      expect(financialRows?.some((row: Required<Pick<NumericRow, "type" | "amount">>) => row.type === "income" && Number(row.amount) === 300)).toBe(true);
    } finally {
      await cleanupLiveArtifacts(adminClient, email);
    }
  });
});
