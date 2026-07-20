import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { cleanupLiveArtifacts, createAdminClient, createUserClient, findUserIdByEmail } from "./live-test-helpers";

const isLiveE2EEnabled = process.env.E2E_LIVE_SUPABASE === "1";

type NumericRow = {
  current_stock?: number | string | null;
  minimum_stock?: number | string | null;
  total?: number | string | null;
  type?: string | null;
  amount?: number | string | null;
};

test.describe("live reseller flow", () => {
  test.skip(!isLiveE2EEnabled, "Set E2E_LIVE_SUPABASE=1 to run the persistent end-to-end flow against real Supabase.");

  test("creates an approved reseller account and completes the resale flow with real persistence", async ({ page }) => {
    const adminClient = createAdminClient();
    const identity = randomUUID().slice(0, 8);
    const email = `playwright-reseller-${Date.now()}-${identity}@autora.local`;
    const password = `Autora!${randomUUID().slice(0, 12)}`;
    const businessName = `Autora Reseller ${identity}`;
    const productName = `Difusor ${identity}`;
    const purchaseNotes = `purchase-${identity}`;
    const saleNotes = `sale-${identity}`;
    let userId: string | null = null;

    await cleanupLiveArtifacts(adminClient, email);

    try {
      await page.goto("/request-access");
      await page.getByLabel("Nombre").fill("Playwright Reseller");
      await page.getByLabel("Correo").fill(email);
      await page.getByLabel("Emprendimiento").fill(businessName);
      await page.getByRole("button", { name: /solicitar acceso/i }).click();

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
      await expect(page.getByRole("heading", { name: /tu cuenta todavia no puede operar/i })).toBeVisible();

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
          business_type: "reseller",
          currency: "ARS",
          timezone: "America/Argentina/Buenos_Aires"
        })
        .eq("user_id", userId!);

      expect(activateProfileError).toBeNull();

      await page.goto("/settings");
      await expect(page.getByRole("heading", { name: /configuracion/i })).toBeVisible();
      await page.getByPlaceholder("Nombre del emprendimiento").fill(`${businessName} Operativo`);
      await page.getByPlaceholder("Moneda").fill("ARS");
      await page.locator('select[name="businessType"]').selectOption("reseller");
      await page.getByPlaceholder("Zona horaria").fill("America/Argentina/Buenos_Aires");
      await page.getByRole("button", { name: /guardar configuracion/i }).click();
      await expect(page.getByText(/configuracion actualizada/i)).toBeVisible();

      await page.goto("/products");
      await page.getByPlaceholder("Nombre del producto").fill(productName);
      await page.locator('select[name="productType"]').selectOption("resale");
      await page.getByPlaceholder("Unidad de venta").fill("unidad");
      await page.getByPlaceholder("Precio base (opcional)").fill("300");
      await page.getByPlaceholder("Stock minimo (opcional)").fill("4");
      await page.getByRole("button", { name: /crear producto/i }).click();
      await expect(page.getByText(/producto creado/i)).toBeVisible();
      await expect(page.getByText(productName)).toBeVisible();

      await page.goto("/purchases");
      await expect(page.getByText(/las compras ingresan stock de productos/i)).toBeVisible();
      await page.locator('select[name="itemId"]').selectOption({ label: productName });
      await page.getByPlaceholder("Cantidad").fill("5");
      await page.getByPlaceholder("Precio unitario").fill("200");
      await page.getByPlaceholder("Nota opcional").fill(purchaseNotes);
      await page.getByRole("button", { name: /registrar compra/i }).click();
      await expect(page.getByText(/compra registrada/i)).toBeVisible();
      await expect(page.getByText(purchaseNotes)).toBeVisible();

      await page.goto("/production");
      await expect(page.getByText(/modulo no requerido para reventa/i)).toBeVisible();

      await page.goto("/consumptions");
      await expect(page.getByText(/modulo no requerido para reventa/i)).toBeVisible();

      await page.goto("/pricing");
      await expect(page.getByText(/modulo no requerido para reventa/i)).toBeVisible();

      await page.goto("/sales");
      await page.locator('select[name="productId"]').selectOption({ label: productName });
      await page.getByPlaceholder("Cantidad").fill("2");
      await page.getByPlaceholder("Precio unitario").fill("300");
      await page.getByPlaceholder("Nota opcional").fill(saleNotes);
      await page.getByRole("button", { name: /registrar venta/i }).click();
      await expect(page.getByText(/venta registrada/i)).toBeVisible();
      await expect(page.getByText(saleNotes)).toBeVisible();

      await page.goto("/dashboard");
      await expect(page.getByRole("heading", { name: /tu negocio, en un solo vistazo/i })).toBeVisible();
      const dashboardKpis = page.locator("section").first();
      await expect(dashboardKpis.getByText("600.00").first()).toBeVisible();
      await expect(dashboardKpis.getByText("1000.00").first()).toBeVisible();
      await expect(dashboardKpis.getByText("-400.00").first()).toBeVisible();
      await expect(page.getByText(/revisar/i)).toBeVisible();
      await expect(page.getByText(saleNotes)).toBeVisible();

      const userClient = createUserClient();
      const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
        email,
        password
      });

      expect(signInError).toBeNull();
      expect(signInData.user?.id).toBeTruthy();

      const productStockResponse = await userClient
        .from("product_stock_view")
        .select("current_stock, minimum_stock")
        .eq("user_id", signInData.user!.id);
      const saleResponse = await userClient
        .from("sales")
        .select("total, notes")
        .eq("user_id", signInData.user!.id)
        .eq("notes", saleNotes);
      const purchaseResponse = await userClient
        .from("purchases")
        .select("total, notes, purchase_type")
        .eq("user_id", signInData.user!.id)
        .eq("notes", purchaseNotes);
      const financialResponse = await userClient
        .from("financial_movements")
        .select("type, amount, description")
        .eq("user_id", signInData.user!.id);

      const productStockRows = (productStockResponse.data ?? []) as Array<Required<Pick<NumericRow, "current_stock" | "minimum_stock">>>;
      const saleRows = (saleResponse.data ?? []) as Array<Required<Pick<NumericRow, "total">> & { notes: string | null }>;
      const purchaseRows = (purchaseResponse.data ?? []) as Array<Required<Pick<NumericRow, "total">> & { notes: string | null; purchase_type: string | null }>;
      const financialRows = (financialResponse.data ?? []) as Array<Required<Pick<NumericRow, "type" | "amount">> & { description: string | null }>;

      expect(Number(productStockRows[0]?.current_stock ?? 0)).toBe(3);
      expect(Number(productStockRows[0]?.minimum_stock ?? 0)).toBe(4);
      expect(Number(saleRows[0]?.total ?? 0)).toBe(600);
      expect(Number(purchaseRows[0]?.total ?? 0)).toBe(1000);
      expect(purchaseRows[0]?.purchase_type).toBe("product");
      expect(financialRows.some((row: Required<Pick<NumericRow, "type" | "amount">>) => row.type === "expense" && Number(row.amount) === 1000)).toBe(true);
      expect(financialRows.some((row: Required<Pick<NumericRow, "type" | "amount">>) => row.type === "income" && Number(row.amount) === 600)).toBe(true);
    } finally {
      await cleanupLiveArtifacts(adminClient, email);
    }
  });
});
