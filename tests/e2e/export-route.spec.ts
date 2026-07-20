import { expect, test } from "@playwright/test";

test("export route redirects anonymous users to login", async ({ page }) => {
  const response = await page.goto("/api/export");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /autora/i })).toBeVisible();
});

test("csv export route also redirects anonymous users to login", async ({ page }) => {
  const response = await page.goto("/api/export?format=csv");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /autora/i })).toBeVisible();
});
