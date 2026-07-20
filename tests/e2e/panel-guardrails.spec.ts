import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function expectGuardOutcome(page: Page) {
  await page.waitForLoadState("domcontentloaded");

  if (/\/login$/u.test(page.url())) {
    await expect(page.getByRole("heading", { name: /autora/i })).toBeVisible();
    return;
  }

  await expect(page.getByRole("heading", { name: /faltan variables de entorno de supabase/i })).toBeVisible();
  await expect(page.getByText(/persistencia/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /recursos/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /administracion/i })).toBeVisible();
}

const guardedRoutes = [
  "/dashboard",
  "/resources",
  "/products",
  "/recipes",
  "/purchases",
  "/consumptions",
  "/production",
  "/sales",
  "/results",
  "/pricing",
  "/settings",
  "/admin"
];

test.describe("panel guardrails", () => {
  for (const route of guardedRoutes) {
    test(`resolves the expected guard on ${route}`, async ({ page }) => {
      await page.goto(route);

      await expectGuardOutcome(page);
    });
  }
});
