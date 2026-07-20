import { expect, test } from "@playwright/test";

test.describe("configuration and access guards", () => {
  test("dashboard shows configuration guidance when supabase env is missing", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: /faltan variables de entorno de supabase/i })).toBeVisible();
    await expect(page.getByText(/\.env\.local/i)).toBeVisible();
  });

  test("admin uses the same safe fallback when supabase env is missing", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.getByRole("heading", { name: /faltan variables de entorno de supabase/i })).toBeVisible();
    await expect(page.getByText(/persistencia/i)).toBeVisible();
  });

  test("reset password without a recovery token explains the expected flow", async ({ page }) => {
    await page.goto("/reset-password");

    await expect(page.getByRole("heading", { name: /definir nueva contrasena/i })).toBeVisible();
    await expect(page.getByText(/ingresa desde el enlace que recibiste por correo/i)).toBeVisible();
  });
});
