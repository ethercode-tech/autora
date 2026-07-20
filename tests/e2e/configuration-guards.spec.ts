import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function expectGuardOutcome(page: Page) {
  await page.waitForLoadState("domcontentloaded");

  if (/\/login$/u.test(page.url())) {
    await expect(page.getByRole("heading", { name: /autora/i })).toBeVisible();
    return;
  }

  await expect(page.getByRole("heading", { name: /faltan variables de entorno de supabase/i })).toBeVisible();
}

test.describe("configuration and access guards", () => {
  test("dashboard resolves to the correct guard depending on Supabase configuration", async ({ page }) => {
    await page.goto("/dashboard");

    await expectGuardOutcome(page);
  });

  test("admin resolves to the correct guard depending on Supabase configuration", async ({ page }) => {
    await page.goto("/admin");

    await expectGuardOutcome(page);
  });

  test("reset password without a recovery token explains the expected flow", async ({ page }) => {
    await page.goto("/reset-password");

    await expect(page.getByRole("heading", { name: /definir nueva contrasena/i })).toBeVisible();
    await expect(page.getByText(/ingresa desde el enlace que recibiste por correo/i)).toBeVisible();
  });
});
