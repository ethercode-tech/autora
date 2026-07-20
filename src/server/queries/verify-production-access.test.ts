import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type ProductionAccessModule = {
  getMissingProductionAccessEnvKeys: (env?: Record<string, string | undefined>) => string[];
  resolveProductionAccessConfig: (env?: Record<string, string | undefined>) => {
    baseUrl: string;
    chromePath: string;
    admin: {
      email: string;
      password: string;
    };
    business: {
      email: string;
      password: string;
    };
  };
};

let productionAccessModule: ProductionAccessModule;

beforeAll(async () => {
  productionAccessModule = (await import(
    pathToFileURL(path.resolve(process.cwd(), "scripts", "verify-production-access.mjs")).href
  )) as ProductionAccessModule;
});

describe("verify production access helpers", () => {
  it("reports all missing environment inputs", () => {
    expect(productionAccessModule.getMissingProductionAccessEnvKeys({})).toEqual([
      "PRODUCTION_BASE_URL or E2E_EXTERNAL_BASE_URL or NEXT_PUBLIC_APP_URL",
      "PRODUCTION_ADMIN_EMAIL",
      "PRODUCTION_ADMIN_PASSWORD",
      "PRODUCTION_BUSINESS_EMAIL",
      "PRODUCTION_BUSINESS_PASSWORD"
    ]);
  });

  it("resolves configuration from explicit production env", () => {
    expect(
      productionAccessModule.resolveProductionAccessConfig({
        PRODUCTION_BASE_URL: "https://autoracontable.vercel.app",
        PRODUCTION_ADMIN_EMAIL: "admin@autora.local",
        PRODUCTION_ADMIN_PASSWORD: "secret-1",
        PRODUCTION_BUSINESS_EMAIL: "lumiq@autora.local",
        PRODUCTION_BUSINESS_PASSWORD: "secret-2"
      })
    ).toMatchObject({
      baseUrl: "https://autoracontable.vercel.app",
      admin: {
        email: "admin@autora.local",
        password: "secret-1"
      },
      business: {
        email: "lumiq@autora.local",
        password: "secret-2"
      }
    });
  });

  it("falls back to E2E_EXTERNAL_BASE_URL when base url is omitted", () => {
    expect(
      productionAccessModule.resolveProductionAccessConfig({
        E2E_EXTERNAL_BASE_URL: "https://autoracontable.vercel.app"
      }).baseUrl
    ).toBe("https://autoracontable.vercel.app");
  });
});
