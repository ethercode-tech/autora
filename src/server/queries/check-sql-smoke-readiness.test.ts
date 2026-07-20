import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type ReadinessModule = {
  formatReadinessSummary: (readiness: {
    ready: boolean;
    missingEnvKeys: string[];
    missingFiles: string[];
    psql: {
      available: boolean;
      psqlPath: string;
    };
  }) => string;
  getMissingReadinessEnvKeys: (env?: Record<string, string | undefined>) => string[];
};

let readinessModule: ReadinessModule;

beforeAll(async () => {
  readinessModule = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "check-sql-smoke-readiness.mjs")).href)) as ReadinessModule;
});

describe("sql smoke readiness helpers", () => {
  it("reports missing readiness env keys when the environment is incomplete", () => {
    expect(readinessModule.getMissingReadinessEnvKeys({})).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_DB_URL or DATABASE_URL"
    ]);
  });

  it("accepts an environment with public keys and database url", () => {
    expect(
      readinessModule.getMissingReadinessEnvKeys({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_DB_URL: "postgres://db"
      })
    ).toEqual([]);
  });

  it("formats a readable readiness summary", () => {
    const summary = readinessModule.formatReadinessSummary({
      ready: false,
      missingEnvKeys: ["SUPABASE_DB_URL or DATABASE_URL"],
      missingFiles: ["tests/rls/rls-smoke.sql"],
      psql: {
        available: false,
        psqlPath: "psql"
      }
    });

    expect(summary).toContain("ready=no");
    expect(summary).toContain("psql=missing");
    expect(summary).toContain("missing env: SUPABASE_DB_URL or DATABASE_URL");
    expect(summary).toContain("missing files: tests/rls/rls-smoke.sql");
  });
});
