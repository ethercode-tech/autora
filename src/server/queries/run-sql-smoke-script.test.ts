import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type SmokeRunnerModule = {
  SQL_SMOKE_SUITES: Record<string, string[]>;
  buildPsqlArguments: (databaseUrl: string, sqlFilePath: string) => string[];
  buildPsqlEnvironment: (env?: Record<string, string | undefined>) => Record<string, string | undefined>;
  buildWindowsPsqlCandidates: (env?: Record<string, string | undefined>) => string[];
  resolveDatabaseUrl: (env?: Record<string, string | undefined>) => string | null;
  resolvePsqlBinary: (env?: Record<string, string | undefined>) => string;
  resolveSelectedSuite: (selection?: string) => {
    suite: string;
    files: string[];
  };
};

let smokeRunner: SmokeRunnerModule;

beforeAll(async () => {
  smokeRunner = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "run-sql-smoke.mjs")).href)) as SmokeRunnerModule;
});

describe("run sql smoke script helpers", () => {
  it("exposes the expected suite map", () => {
    expect(smokeRunner.SQL_SMOKE_SUITES.all).toEqual([
      "tests/rls/rls-smoke.sql",
      "tests/rls/multiuser-smoke.sql",
      "tests/integration/operational-flow-smoke.sql"
    ]);
  });

  it("resolves a known suite into its files", () => {
    expect(smokeRunner.resolveSelectedSuite("operational")).toEqual({
      suite: "operational",
      files: ["tests/integration/operational-flow-smoke.sql"]
    });
  });

  it("rejects unknown suites with a useful error", () => {
    expect(() => smokeRunner.resolveSelectedSuite("unknown")).toThrow(/supported values/i);
  });

  it("prefers SUPABASE_DB_URL over DATABASE_URL", () => {
    expect(
      smokeRunner.resolveDatabaseUrl({
        SUPABASE_DB_URL: "postgres://supabase",
        DATABASE_URL: "postgres://fallback"
      })
    ).toBe("postgres://supabase");
  });

  it("falls back to DATABASE_URL when needed", () => {
    expect(smokeRunner.resolveDatabaseUrl({ DATABASE_URL: "postgres://fallback" })).toBe("postgres://fallback");
    expect(smokeRunner.resolveDatabaseUrl({})).toBeNull();
  });

  it("uses PSQL_PATH when provided", () => {
    expect(smokeRunner.resolvePsqlBinary({ PSQL_PATH: "C:\\psql\\psql.exe" })).toBe("C:\\psql\\psql.exe");
  });

  it("builds Windows psql candidates from common PostgreSQL install paths", () => {
    expect(
      smokeRunner.buildWindowsPsqlCandidates({
        ProgramFiles: "C:\\Program Files",
        "ProgramFiles(x86)": "C:\\Program Files (x86)"
      }).slice(0, 3)
    ).toEqual([
      "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe",
      "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe",
      "C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe"
    ]);
  });

  it("falls back to bare psql when no explicit path is configured", () => {
    expect(smokeRunner.resolvePsqlBinary({})).toBeTypeOf("string");
  });

  it("builds psql arguments with ON_ERROR_STOP and no interactive password prompt", () => {
    const filePath = path.resolve("tests/rls/rls-smoke.sql");

    expect(smokeRunner.buildPsqlArguments("postgres://db", filePath)).toEqual(["postgres://db", "-w", "-v", "ON_ERROR_STOP=1", "-f", filePath]);
  });

  it("forces a connection timeout when none is configured", () => {
    expect(smokeRunner.buildPsqlEnvironment({ PATH: "C:\\psql" })).toEqual({
      PATH: "C:\\psql",
      PGCONNECT_TIMEOUT: "15"
    });
  });

  it("preserves an explicit PGCONNECT_TIMEOUT override", () => {
    expect(smokeRunner.buildPsqlEnvironment({ PGCONNECT_TIMEOUT: "30" }).PGCONNECT_TIMEOUT).toBe("30");
  });
});
