import { expect, test } from "@playwright/test";

test.describe("access and onboarding screens", () => {
  test("request access explains the manual approval flow and exposes the request form", async ({ page }) => {
    await page.goto("/request-access");

    await expect(page.getByRole("heading", { name: /solicit/i })).toBeVisible();
    await expect(page.getByText(/manual/i)).toBeVisible();
    await expect(page.getByRole("textbox", { name: /nombre/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /correo/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /emprendimiento/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /solicitar acceso/i })).toBeVisible();
  });

  test("login routes users to recovery and controlled signup", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText(/solo las cuentas aprobadas y activas/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /olvide mi contrasena/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /crear cuenta/i })).toBeVisible();

    await page.getByRole("button", { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: /cuenta/i })).toBeVisible();
    await expect(page.getByText(/solicitudes previamente aprobadas/i)).toBeVisible();
    await expect(page.getByRole("textbox", { name: /correo aprobado/i })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(2);
    await expect(page.getByRole("button", { name: /crear cuenta/i })).toBeVisible();
  });

  test("forgot and reset password screens explain the recovery flow", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.getByRole("heading", { name: /recuperar acceso/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /enviar enlace de recuperacion/i })).toBeVisible();

    await page.goto("/reset-password");

    await expect(page.getByRole("heading", { name: /definir nueva contrasena/i })).toBeVisible();
    await expect(page.getByText(/ingresa desde el enlace que recibiste por correo/i)).toBeVisible();
  });

  test("request access remains usable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/request-access");

    await expect(page.getByRole("heading", { name: /solicit/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /solicitar acceso/i })).toBeVisible();
  });
});
