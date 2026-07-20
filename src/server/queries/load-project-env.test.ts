import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type EnvLoaderModule = {
  parseDotEnv: (content: string) => Record<string, string>;
};

let envLoader: EnvLoaderModule;

beforeAll(async () => {
  envLoader = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "load-project-env.mjs")).href)) as EnvLoaderModule;
});

describe("load project env helpers", () => {
  it("parses dotenv lines and ignores comments", () => {
    expect(
      envLoader.parseDotEnv(`
# comment
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
SUPABASE_DB_URL="postgres://db"
PSQL_PATH='C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe'
`)
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_DB_URL: "postgres://db",
      PSQL_PATH: "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe"
    });
  });
});
