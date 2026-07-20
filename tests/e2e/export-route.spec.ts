import { expect, test } from "@playwright/test";

test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-project-url", "Supabase no esta configurado en este entorno.");

test("export route redirects anonymous users to login", async ({ page }) => {
  const response = await page.goto("/api/export");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /autora/i })).toBeVisible();
});
