import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type RunLiveE2EModule = {
  LIVE_E2E_SUITES: Record<string, string[]>;
  resolveRequestedSuite: (args?: string[]) => string;
  buildLiveE2ERunEnv: (env: Record<string, string | undefined>) => Record<string, string | undefined>;
};

let liveE2ERunner: RunLiveE2EModule;

beforeAll(async () => {
  liveE2ERunner = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "run-live-e2e.mjs")).href)) as RunLiveE2EModule;
});

describe("run live e2e script helpers", () => {
  it("exposes the expected suite map", () => {
    expect(liveE2ERunner.LIVE_E2E_SUITES).toEqual({
      manufacturer: ["tests/e2e/live-manufacturer-flow.spec.ts"],
      reseller: ["tests/e2e/live-reseller-flow.spec.ts"],
      all: ["tests/e2e/live-manufacturer-flow.spec.ts", "tests/e2e/live-reseller-flow.spec.ts"]
    });
  });

  it("defaults to the all suite when no argument is provided", () => {
    expect(liveE2ERunner.resolveRequestedSuite([])).toBe("all");
  });

  it("accepts known suite names", () => {
    expect(liveE2ERunner.resolveRequestedSuite(["manufacturer"])).toBe("manufacturer");
    expect(liveE2ERunner.resolveRequestedSuite(["reseller"])).toBe("reseller");
  });

  it("rejects unknown suite names with a useful error", () => {
    expect(() => liveE2ERunner.resolveRequestedSuite(["unknown"])).toThrow(/unknown live e2e suite/i);
  });

  it("builds the run environment with production and live flags", () => {
    expect(liveE2ERunner.buildLiveE2ERunEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" })).toMatchObject({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      E2E_LIVE_SUPABASE: "1",
      E2E_USE_PROD_SERVER: "1",
      PLAYWRIGHT_PORT: "3100"
    });
  });

  it("preserves an explicit Playwright port override", () => {
    expect(
      liveE2ERunner.buildLiveE2ERunEnv({
        PLAYWRIGHT_PORT: "3200"
      }).PLAYWRIGHT_PORT
    ).toBe("3200");
  });
});
