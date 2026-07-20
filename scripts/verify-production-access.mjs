import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { loadResolvedEnv } from "./load-project-env.mjs";

const DEFAULT_CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export function getMissingProductionAccessEnvKeys(env = process.env) {
  const missing = [];

  if (!env.PRODUCTION_BASE_URL && !env.E2E_EXTERNAL_BASE_URL && !env.NEXT_PUBLIC_APP_URL) {
    missing.push("PRODUCTION_BASE_URL or E2E_EXTERNAL_BASE_URL or NEXT_PUBLIC_APP_URL");
  }

  if (!env.PRODUCTION_ADMIN_EMAIL) {
    missing.push("PRODUCTION_ADMIN_EMAIL");
  }

  if (!env.PRODUCTION_ADMIN_PASSWORD) {
    missing.push("PRODUCTION_ADMIN_PASSWORD");
  }

  if (!env.PRODUCTION_BUSINESS_EMAIL) {
    missing.push("PRODUCTION_BUSINESS_EMAIL");
  }

  if (!env.PRODUCTION_BUSINESS_PASSWORD) {
    missing.push("PRODUCTION_BUSINESS_PASSWORD");
  }

  return missing;
}

export function resolveProductionAccessConfig(env = process.env) {
  return {
    baseUrl: env.PRODUCTION_BASE_URL || env.E2E_EXTERNAL_BASE_URL || env.NEXT_PUBLIC_APP_URL || "",
    chromePath: env.PLAYWRIGHT_CHROME_PATH || DEFAULT_CHROME_PATH,
    admin: {
      email: env.PRODUCTION_ADMIN_EMAIL || "",
      password: env.PRODUCTION_ADMIN_PASSWORD || ""
    },
    business: {
      email: env.PRODUCTION_BUSINESS_EMAIL || "",
      password: env.PRODUCTION_BUSINESS_PASSWORD || ""
    }
  };
}

async function verifyLogin({ browser, baseUrl, email, password, expectedUrlFragment, expectedBodyText }) {
  const page = await browser.newPage({ baseURL: baseUrl });

  try {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contrasena").fill(password);
    await page.getByRole("button", { name: /ingresar/i }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForURL(new RegExp(expectedUrlFragment), { timeout: 20000 });

    const currentUrl = page.url();
    const bodyText = await page.locator("body").innerText();

    if (!new RegExp(expectedBodyText, "i").test(bodyText)) {
      throw new Error(`Login for ${email} reached ${currentUrl} but did not render expected text "${expectedBodyText}".`);
    }

    return {
      email,
      url: currentUrl
    };
  } finally {
    await page.close();
  }
}

export async function verifyProductionAccess({ env = process.env, cwd = process.cwd() } = {}) {
  const resolvedEnv = await loadResolvedEnv(env, cwd);
  const missingEnvKeys = getMissingProductionAccessEnvKeys(resolvedEnv);

  if (missingEnvKeys.length > 0) {
    throw new Error(`Missing production access env: ${missingEnvKeys.join(", ")}`);
  }

  const config = resolveProductionAccessConfig(resolvedEnv);
  const browser = await chromium.launch({
    executablePath: config.chromePath,
    headless: true
  });

  try {
    const adminResult = await verifyLogin({
      browser,
      baseUrl: config.baseUrl,
      email: config.admin.email,
      password: config.admin.password,
      expectedUrlFragment: "/admin",
      expectedBodyText: "Panel administrativo"
    });

    const businessResult = await verifyLogin({
      browser,
      baseUrl: config.baseUrl,
      email: config.business.email,
      password: config.business.password,
      expectedUrlFragment: "/dashboard",
      expectedBodyText: "Tu negocio, en un solo vistazo"
    });

    process.stdout.write(`[production-access] admin=${adminResult.url}\n`);
    process.stdout.write(`[production-access] business=${businessResult.url}\n`);

    return {
      adminResult,
      businessResult
    };
  } finally {
    await browser.close();
  }
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  verifyProductionAccess().catch((error) => {
    process.stderr.write(`[production-access] ${error.message}\n`);
    process.exitCode = 1;
  });
}
