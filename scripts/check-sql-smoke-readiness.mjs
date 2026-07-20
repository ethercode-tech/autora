import { access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { loadResolvedEnv } from "./load-project-env.mjs";
import { resolveDatabaseUrl, resolvePsqlBinary, isPostgresConnectionString, SQL_SMOKE_SUITES } from "./run-sql-smoke.mjs";

const REQUIRED_ENV_KEYS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

export function getMissingReadinessEnvKeys(env = process.env) {
  const missingKeys = REQUIRED_ENV_KEYS.filter((key) => !env[key]);
  const databaseUrl = resolveDatabaseUrl(env);

  if (!databaseUrl) {
    missingKeys.push("SUPABASE_DB_URL or DATABASE_URL");
  } else if (!isPostgresConnectionString(databaseUrl)) {
    missingKeys.push("SUPABASE_DB_URL or DATABASE_URL (must start with postgres:// or postgresql://)");
  }

  return missingKeys;
}

export async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function getMissingSmokeFiles(cwd = process.cwd()) {
  const missingFiles = [];

  for (const relativePath of SQL_SMOKE_SUITES.all) {
    const absolutePath = path.resolve(cwd, relativePath);

    if (!(await fileExists(absolutePath))) {
      missingFiles.push(relativePath);
    }
  }

  return missingFiles;
}

export async function resolvePsqlAvailability(env = process.env, cwd = process.cwd()) {
  const psqlPath = resolvePsqlBinary(env);

  return new Promise((resolve) => {
    const child = spawn(psqlPath, ["--version"], {
      cwd,
      stdio: "ignore",
      shell: false
    });

    child.on("error", () => {
      resolve({
        available: false,
        psqlPath
      });
    });

    child.on("exit", (code) => {
      resolve({
        available: code === 0,
        psqlPath
      });
    });
  });
}

export async function getSqlSmokeReadiness({ env = process.env, cwd = process.cwd() } = {}) {
  const resolvedEnv = await loadResolvedEnv(env, cwd);
  const missingEnvKeys = getMissingReadinessEnvKeys(resolvedEnv);
  const missingFiles = await getMissingSmokeFiles(cwd);
  const psql = await resolvePsqlAvailability(resolvedEnv, cwd);

  return {
    ready: missingEnvKeys.length === 0 && missingFiles.length === 0 && psql.available,
    missingEnvKeys,
    missingFiles,
    psql
  };
}

export function formatReadinessSummary(readiness) {
  const lines = [];

  lines.push(`[sql-smoke:check] ready=${readiness.ready ? "yes" : "no"}`);
  lines.push(`[sql-smoke:check] psql=${readiness.psql.available ? "ok" : "missing"} (${readiness.psql.psqlPath})`);

  if (readiness.missingEnvKeys.length > 0) {
    lines.push(`[sql-smoke:check] missing env: ${readiness.missingEnvKeys.join(", ")}`);
  }

  if (readiness.missingFiles.length > 0) {
    lines.push(`[sql-smoke:check] missing files: ${readiness.missingFiles.join(", ")}`);
  }

  if (readiness.ready) {
    lines.push("[sql-smoke:check] You can run: pnpm test:sql-smoke");
  }

  return lines.join("\n");
}

export async function runSqlSmokeReadinessCheck(options = {}) {
  const readiness = await getSqlSmokeReadiness(options);
  const summary = formatReadinessSummary(readiness);

  process.stdout.write(`${summary}\n`);

  if (!readiness.ready) {
    process.exitCode = 1;
  }

  return readiness;
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runSqlSmokeReadinessCheck().catch((error) => {
    process.stderr.write(`[sql-smoke:check] ${error.message}\n`);
    process.exitCode = 1;
  });
}
