import { expect, test } from "@playwright/test";

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
    test(`shows the safe configuration fallback on ${route}`, async ({ page }) => {
      await page.goto(route);

      await expect(page.getByRole("heading", { name: /faltan variables de entorno de supabase/i })).toBeVisible();
      await expect(page.getByText(/persistencia/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /recursos/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /administracion/i })).toBeVisible();
    });
  }
});
