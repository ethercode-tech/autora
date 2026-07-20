import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type LiveVerificationModule = {
  buildLiveVerificationIdentity: (prefix?: string) => {
    suffix: string;
    primaryEmail: string;
    secondaryEmail: string;
    password: string;
  };
  createSummaryLines: (result: {
    success: boolean;
    createdUsers: number;
    checks: Array<{ name: string; ok: boolean; detail?: string }>;
  }) => string[];
};

let liveVerificationModule: LiveVerificationModule;

beforeAll(async () => {
  liveVerificationModule = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "verify-live-supabase.mjs")).href)) as LiveVerificationModule;
});

describe("verify live supabase script helpers", () => {
  it("builds distinct test identities for live verification", () => {
    const identity = liveVerificationModule.buildLiveVerificationIdentity("autora-test");

    expect(identity.suffix).toContain("autora-test");
    expect(identity.primaryEmail).toContain("@autora.local");
    expect(identity.secondaryEmail).toContain("@autora.local");
    expect(identity.primaryEmail).not.toBe(identity.secondaryEmail);
    expect(identity.password).toContain("Autora!");
  });

  it("formats readable summary lines", () => {
    expect(
      liveVerificationModule.createSummaryLines({
        success: true,
        createdUsers: 2,
        checks: [{ name: "rls_hides_foreign_resources", ok: true }]
      })
    ).toEqual([
      "[live-supabase] status=ok",
      "[live-supabase] created-users=2",
      "[live-supabase] checks=1",
      "[live-supabase] rls_hides_foreign_resources=ok"
    ]);
  });
});
