import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type ApplySqlFilesModule = {
  resolveSqlFileArguments: (args?: string[]) => string[];
  buildAppliedFilesSummary: (files: string[]) => string;
};

let applySqlFilesModule: ApplySqlFilesModule;

beforeAll(async () => {
  applySqlFilesModule = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "apply-sql-files.mjs")).href)) as ApplySqlFilesModule;
});

describe("apply SQL files script helpers", () => {
  it("requires at least one SQL file argument", () => {
    expect(() => applySqlFilesModule.resolveSqlFileArguments([])).toThrow("Pass one or more SQL files to apply.");
  });

  it("preserves file ordering in the apply summary", () => {
    expect(
      applySqlFilesModule.buildAppliedFilesSummary([
        "supabase/migrations/202607200004_admin_commercial_rls.sql",
        "supabase/migrations/202607200005_fix_is_admin_recursion.sql"
      ])
    ).toBe(
      "[apply-sql] applying 2 file(s): supabase/migrations/202607200004_admin_commercial_rls.sql, supabase/migrations/202607200005_fix_is_admin_recursion.sql"
    );
  });
});
