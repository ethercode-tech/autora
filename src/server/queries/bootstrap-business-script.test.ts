import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type BootstrapBusinessModule = {
  parseBootstrapBusinessArgs: (argv?: string[]) => {
    email: string;
    password?: string;
    businessName: string;
    businessType: string;
    currency: string;
    timezone: string;
    accountStatus: string;
    onboardingCompleted: boolean;
  };
  createBootstrapBusinessSummary: (result: {
    businessName: string;
    email: string;
    userId: string;
    authUserAction: string;
    profileAction: string;
    password: string | null;
    seed: {
      measurementUnitsSeeded: number;
      resourcesSeeded: number;
      productsSeeded: number;
      recipeId: string;
    };
  }) => string[];
};

let bootstrapBusinessModule: BootstrapBusinessModule;

beforeAll(async () => {
  bootstrapBusinessModule = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "bootstrap-business.mjs")).href)) as BootstrapBusinessModule;
});

describe("bootstrap business script helpers", () => {
  it("parses a minimal business bootstrap command", () => {
    expect(bootstrapBusinessModule.parseBootstrapBusinessArgs(["--email", "Lumiq@Autora.local"])).toEqual({
      email: "lumiq@autora.local",
      businessName: "Lumiq",
      businessType: "manufacturer",
      currency: "ARS",
      timezone: "America/Argentina/Buenos_Aires",
      accountStatus: "active",
      onboardingCompleted: true
    });
  });

  it("preserves explicit overrides", () => {
    expect(
      bootstrapBusinessModule.parseBootstrapBusinessArgs([
        "--email",
        "ops@lumiq.local",
        "--password",
        "Secret123!",
        "--business-name",
        "Lumiq Lab",
        "--business-type",
        "reseller",
        "--currency",
        "usd",
        "--timezone",
        "UTC",
        "--account-status",
        "approved_pending_payment"
      ])
    ).toEqual({
      email: "ops@lumiq.local",
      password: "Secret123!",
      businessName: "Lumiq Lab",
      businessType: "reseller",
      currency: "USD",
      timezone: "UTC",
      accountStatus: "approved_pending_payment",
      onboardingCompleted: true
    });
  });

  it("formats a readable bootstrap summary", () => {
    expect(
      bootstrapBusinessModule.createBootstrapBusinessSummary({
        businessName: "Lumiq",
        email: "lumiq@autora.local",
        userId: "user-1",
        authUserAction: "created",
        profileAction: "created",
        password: "Autora!123456",
        seed: {
          measurementUnitsSeeded: 2,
          resourcesSeeded: 4,
          productsSeeded: 2,
          recipeId: "recipe-1"
        }
      })
    ).toEqual([
      "[business:bootstrap] status=ok",
      "[business:bootstrap] business=Lumiq",
      "[business:bootstrap] email=lumiq@autora.local",
      "[business:bootstrap] user-id=user-1",
      "[business:bootstrap] auth-user=created",
      "[business:bootstrap] profile=created",
      "[business:bootstrap] measurement-units=2",
      "[business:bootstrap] resources=4",
      "[business:bootstrap] products=2",
      "[business:bootstrap] recipe-id=recipe-1",
      "[business:bootstrap] password=Autora!123456"
    ]);
  });
});
