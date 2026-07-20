import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type BootstrapAdminModule = {
  parseBootstrapAdminArgs: (argv?: string[]) => {
    email: string;
    password?: string;
    businessName: string;
    businessType: string;
    currency: string;
    timezone: string;
    accountStatus: string;
    role: string;
  };
  createBootstrapSummary: (result: {
    email: string;
    userId: string;
    authUserAction: string;
    profileAction: string;
    password: string | null;
  }) => string[];
};

let bootstrapAdminModule: BootstrapAdminModule;

beforeAll(async () => {
  bootstrapAdminModule = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "bootstrap-admin.mjs")).href)) as BootstrapAdminModule;
});

describe("bootstrap admin script helpers", () => {
  it("parses a minimal admin bootstrap command", () => {
    expect(bootstrapAdminModule.parseBootstrapAdminArgs(["--email", "Admin@Autora.local"])).toEqual({
      email: "admin@autora.local",
      businessName: "AUTORA Administracion",
      businessType: "manufacturer",
      currency: "ARS",
      timezone: "America/Argentina/Buenos_Aires",
      accountStatus: "active",
      role: "admin"
    });
  });

  it("preserves explicit overrides", () => {
    expect(
      bootstrapAdminModule.parseBootstrapAdminArgs([
        "--email",
        "ops@autora.local",
        "--password",
        "Secret123!",
        "--business-name",
        "AUTORA Operaciones",
        "--business-type",
        "reseller",
        "--currency",
        "usd",
        "--timezone",
        "UTC",
        "--account-status",
        "approved_pending_payment",
        "--role",
        "owner"
      ])
    ).toEqual({
      email: "ops@autora.local",
      password: "Secret123!",
      businessName: "AUTORA Operaciones",
      businessType: "reseller",
      currency: "USD",
      timezone: "UTC",
      accountStatus: "approved_pending_payment",
      role: "owner"
    });
  });

  it("formats a readable bootstrap summary", () => {
    expect(
      bootstrapAdminModule.createBootstrapSummary({
        email: "admin@autora.local",
        userId: "user-1",
        authUserAction: "created",
        profileAction: "created",
        password: "Autora!123456"
      })
    ).toEqual([
      "[admin:bootstrap] status=ok",
      "[admin:bootstrap] email=admin@autora.local",
      "[admin:bootstrap] user-id=user-1",
      "[admin:bootstrap] auth-user=created",
      "[admin:bootstrap] profile=created",
      "[admin:bootstrap] admin-role=active",
      "[admin:bootstrap] password=Autora!123456"
    ]);
  });
});
