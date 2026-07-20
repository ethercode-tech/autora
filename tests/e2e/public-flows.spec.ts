import { expect, test } from "@playwright/test";

test.describe("public flows", () => {
  test("home exposes the main entry points", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /gestion/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /solicitar acceso/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /iniciar sesi|iniciar sesion/i })).toBeVisible();
  });

  test("login links to password recovery", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /autora/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /olvide mi contrasena/i })).toBeVisible();

    await page.getByRole("link", { name: /olvide mi contrasena/i }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByRole("heading", { name: /recuperar acceso/i })).toBeVisible();
  });

  test("forgot password shows a recoverable form", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.getByRole("textbox", { name: /correo/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /enviar enlace de recuperacion/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /volver al ingreso/i })).toBeVisible();
  });
});
