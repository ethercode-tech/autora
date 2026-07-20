import { access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

export const SQL_SMOKE_SUITES = {
  rls: ["tests/rls/rls-smoke.sql"],
  multiuser: ["tests/rls/multiuser-smoke.sql"],
  operational: ["tests/integration/operational-flow-smoke.sql"],
  all: ["tests/rls/rls-smoke.sql", "tests/rls/multiuser-smoke.sql", "tests/integration/operational-flow-smoke.sql"]
};

export function resolveSelectedSuite(selection = "all") {
  const normalizedSelection = selection.toLowerCase();
  const files = SQL_SMOKE_SUITES[normalizedSelection];

  if (!files) {
    const supportedSuites = Object.keys(SQL_SMOKE_SUITES).join(", ");
    throw new Error(`Unknown SQL smoke suite "${selection}". Supported values: ${supportedSuites}.`);
  }

  return {
    suite: normalizedSelection,
    files
  };
}

export function resolveDatabaseUrl(env = process.env) {
  return env.SUPABASE_DB_URL || env.DATABASE_URL || null;
}

export function resolvePsqlBinary(env = process.env) {
  return env.PSQL_PATH || "psql";
}

export function buildPsqlArguments(databaseUrl, sqlFilePath) {
  return [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", sqlFilePath];
}

export async function assertFileExists(filePath) {
  await access(filePath, constants.F_OK);
}

export async function runPsqlFile({ psqlPath, databaseUrl, sqlFilePath, cwd }) {
  await assertFileExists(sqlFilePath);

  return new Promise((resolve, reject) => {
    const child = spawn(psqlPath, buildPsqlArguments(databaseUrl, sqlFilePath), {
      cwd,
      stdio: "inherit",
      shell: false
    });

    child.on("error", (error) => {
      if ("code" in error && error.code === "ENOENT") {
        reject(
          new Error(
            `Could not execute "${psqlPath}". Install PostgreSQL client tools or set PSQL_PATH to a valid psql binary.`
          )
        );
        return;
      }

      reject(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`psql exited with code ${code} while running ${path.basename(sqlFilePath)}.`));
    });
  });
}

export async function runSelectedSqlSmokeSuite({
  suite = "all",
  cwd = process.cwd(),
  env = process.env
} = {}) {
  const selection = resolveSelectedSuite(suite);
  const databaseUrl = resolveDatabaseUrl(env);

  if (!databaseUrl) {
    throw new Error("Missing SUPABASE_DB_URL or DATABASE_URL. Set one of them before running SQL smoke tests.");
  }

  const psqlPath = resolvePsqlBinary(env);

  for (const relativeFilePath of selection.files) {
    const sqlFilePath = path.resolve(cwd, relativeFilePath);
    process.stdout.write(`\n[sql-smoke] Running ${relativeFilePath}\n`);
    await runPsqlFile({
      psqlPath,
      databaseUrl,
      sqlFilePath,
      cwd
    });
  }

  process.stdout.write(`\n[sql-smoke] Suite "${selection.suite}" completed successfully.\n`);
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isDirectExecution) {
  const suite = process.argv[2] || "all";

  runSelectedSqlSmokeSuite({ suite }).catch((error) => {
    process.stderr.write(`\n[sql-smoke] ${error.message}\n`);
    process.exitCode = 1;
  });
}
