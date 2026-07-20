import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type LiveE2EReadinessModule = {
  formatLiveE2EReadinessSummary: (readiness: {
    ready: boolean;
    missingEnvKeys: string[];
    chromePath: string;
    chromeAvailable: boolean;
    specsPresent: boolean;
  }) => string;
};

let readinessModule: LiveE2EReadinessModule;

beforeAll(async () => {
  readinessModule = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "check-live-e2e-readiness.mjs")).href)) as LiveE2EReadinessModule;
});

describe("live e2e readiness helpers", () => {
  it("formats a blocked readiness summary", () => {
    const summary = readinessModule.formatLiveE2EReadinessSummary({
      ready: false,
      missingEnvKeys: ["SUPABASE_SERVICE_ROLE_KEY"],
      chromePath: "C:\\Chrome\\chrome.exe",
      chromeAvailable: false,
      specsPresent: true
    });

    expect(summary).toContain("ready=no");
    expect(summary).toContain("chrome=missing");
    expect(summary).toContain("specs=ok");
    expect(summary).toContain("missing env: SUPABASE_SERVICE_ROLE_KEY");
  });

  it("formats a runnable summary when live e2e is ready", () => {
    const summary = readinessModule.formatLiveE2EReadinessSummary({
      ready: true,
      missingEnvKeys: [],
      chromePath: "C:\\Chrome\\chrome.exe",
      chromeAvailable: true,
      specsPresent: true
    });

    expect(summary).toContain("ready=yes");
    expect(summary).toContain("chrome=ok");
    expect(summary).toContain("You can run: pnpm test:e2e:live");
  });
});
