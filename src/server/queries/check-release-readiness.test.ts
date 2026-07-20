import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type ReleaseReadinessModule = {
  formatReleaseReadinessSummary: (readiness: {
    ready: boolean;
    missingReleaseEnvKeys: string[];
    hasDirectDatabaseUrl: boolean;
    hasHostingConfig: boolean;
    hostingConfig: {
      exists: boolean;
      projectId: string | null;
    };
    liveE2E: {
      ready: boolean;
      chromeAvailable: boolean;
      chromePath: string;
    };
    sqlSmoke: {
      ready: boolean;
      missingEnvKeys: string[];
    };
  }) => string;
};

let readinessModule: ReleaseReadinessModule;

beforeAll(async () => {
  readinessModule = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "check-release-readiness.mjs")).href)) as ReleaseReadinessModule;
});

describe("release readiness helpers", () => {
  it("formats a blocked release summary with external blockers", () => {
    const summary = readinessModule.formatReleaseReadinessSummary({
      ready: false,
      missingReleaseEnvKeys: [],
      hasDirectDatabaseUrl: false,
      hasHostingConfig: false,
      hostingConfig: {
        exists: false,
        projectId: null
      },
      liveE2E: {
        ready: true,
        chromeAvailable: true,
        chromePath: "C:\\Chrome\\chrome.exe"
      },
      sqlSmoke: {
        ready: false,
        missingEnvKeys: ["SUPABASE_DB_URL or DATABASE_URL"]
      }
    });

    expect(summary).toContain("ready=no");
    expect(summary).toContain("live-e2e=ok");
    expect(summary).toContain("sql-smoke=blocked");
    expect(summary).toContain("direct-db-url=missing");
    expect(summary).toContain("hosting-config=missing");
    expect(summary).toContain("sql blockers: SUPABASE_DB_URL or DATABASE_URL");
    expect(summary).toContain("deploy blocker: .openai/hosting.json is not present in this workspace.");
  });

  it("formats a ready release summary", () => {
    const summary = readinessModule.formatReleaseReadinessSummary({
      ready: true,
      missingReleaseEnvKeys: [],
      hasDirectDatabaseUrl: true,
      hasHostingConfig: true,
      hostingConfig: {
        exists: true,
        projectId: "appgprj_123"
      },
      liveE2E: {
        ready: true,
        chromeAvailable: true,
        chromePath: "C:\\Chrome\\chrome.exe"
      },
      sqlSmoke: {
        ready: true,
        missingEnvKeys: []
      }
    });

    expect(summary).toContain("ready=yes");
    expect(summary).toContain("direct-db-url=present");
    expect(summary).toContain("hosting-config=present");
    expect(summary).toContain("You can run: pnpm test:e2e:live && pnpm test:sql-smoke");
  });
});
