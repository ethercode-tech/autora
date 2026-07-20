import { access } from "node:fs/promises";
import { constants, existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { loadResolvedEnv } from "./load-project-env.mjs";

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
  const explicitUrl = sanitizeEnvValue(env.SUPABASE_DB_URL) || sanitizeEnvValue(env.DATABASE_URL);

  if (isPostgresConnectionString(explicitUrl)) {
    return explicitUrl;
  }

  const derivedUrl = buildDerivedSupabaseDatabaseUrl(env);

  if (derivedUrl) {
    return derivedUrl;
  }

  return explicitUrl || null;
}

export function isPostgresConnectionString(value) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "postgres:" || parsedUrl.protocol === "postgresql:";
  } catch {
    return false;
  }
}

export function sanitizeEnvValue(value) {
  if (typeof value !== "string") {
    return null;
  }

  const sanitized = value.trim();
  return sanitized.length > 0 ? sanitized : null;
}

export function extractSupabaseProjectRef(value) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  try {
    const parsedUrl = new URL(value);
    const [projectRef] = parsedUrl.hostname.split(".");
    return projectRef || null;
  } catch {
    return null;
  }
}

export function buildDerivedSupabaseDatabaseUrl(env = process.env) {
  const password = sanitizeEnvValue(env.SUPABASE_DB_PASSWORD) || sanitizeEnvValue(env.PGPASSWORD);

  if (!password) {
    return null;
  }

  const supabaseUrl = sanitizeEnvValue(env.NEXT_PUBLIC_SUPABASE_URL) || sanitizeEnvValue(env.SUPABASE_URL);
  const projectRef = extractSupabaseProjectRef(supabaseUrl);
  const host = sanitizeEnvValue(env.SUPABASE_DB_HOST) || sanitizeEnvValue(env.PGHOST) || (projectRef ? `db.${projectRef}.supabase.co` : null);

  if (!host) {
    return null;
  }

  const protocol = sanitizeEnvValue(env.SUPABASE_DB_SCHEME) || "postgresql";
  const user = sanitizeEnvValue(env.SUPABASE_DB_USER) || sanitizeEnvValue(env.PGUSER) || "postgres";
  const port = sanitizeEnvValue(env.SUPABASE_DB_PORT) || sanitizeEnvValue(env.PGPORT) || "5432";
  const databaseName = sanitizeEnvValue(env.SUPABASE_DB_NAME) || sanitizeEnvValue(env.PGDATABASE) || "postgres";
  const sslmode = sanitizeEnvValue(env.SUPABASE_DB_SSLMODE) || sanitizeEnvValue(env.PGSSLMODE);
  const connectionUrl = new URL(`${protocol}://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${databaseName}`);

  if (sslmode) {
    connectionUrl.searchParams.set("sslmode", sslmode);
  }

  return connectionUrl.toString();
}

export function resolveValidatedDatabaseUrl(env = process.env) {
  const databaseUrl = resolveDatabaseUrl(env);

  if (!databaseUrl) {
    return null;
  }

  if (!isPostgresConnectionString(databaseUrl)) {
    throw new Error(
      "SQL smoke requires a direct Postgres connection string via SUPABASE_DB_URL or DATABASE_URL, or enough discrete variables to derive one (for example NEXT_PUBLIC_SUPABASE_URL plus SUPABASE_DB_PASSWORD)."
    );
  }

  return databaseUrl;
}

export function buildWindowsPsqlCandidates(env = process.env) {
  const rootDirectories = [env.ProgramFiles, env["ProgramFiles(x86)"]].filter(Boolean);
  const versions = ["17", "16", "15", "14", "13"];
  const candidates = [];

  for (const rootDirectory of rootDirectories) {
    for (const version of versions) {
      candidates.push(path.join(rootDirectory, "PostgreSQL", version, "bin", "psql.exe"));
    }
  }

  return candidates;
}

export function resolvePsqlBinary(env = process.env) {
  if (env.PSQL_PATH) {
    return env.PSQL_PATH;
  }

  if (process.platform === "win32") {
    const installedBinary = buildWindowsPsqlCandidates(env).find((candidate) => existsSync(candidate));

    if (installedBinary) {
      return installedBinary;
    }
  }

  return "psql";
}

export function buildPsqlArguments(databaseUrl, sqlFilePath) {
  return [databaseUrl, "-w", "-v", "ON_ERROR_STOP=1", "-f", sqlFilePath];
}

export function buildPsqlEnvironment(env = process.env) {
  return {
    ...env,
    PGCONNECT_TIMEOUT: env.PGCONNECT_TIMEOUT || "15"
  };
}

export async function assertFileExists(filePath) {
  await access(filePath, constants.F_OK);
}

export async function runPsqlFile({ psqlPath, databaseUrl, sqlFilePath, cwd }) {
  await assertFileExists(sqlFilePath);

  return new Promise((resolve, reject) => {
    const child = spawn(psqlPath, buildPsqlArguments(databaseUrl, sqlFilePath), {
      cwd,
      env: buildPsqlEnvironment(process.env),
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
  const resolvedEnv = await loadResolvedEnv(env, cwd);
  const selection = resolveSelectedSuite(suite);
  const databaseUrl = resolveValidatedDatabaseUrl(resolvedEnv);

  if (!databaseUrl) {
    throw new Error("Missing SUPABASE_DB_URL or DATABASE_URL. Set one of them before running SQL smoke tests.");
  }

  const psqlPath = resolvePsqlBinary(resolvedEnv);

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

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  const suite = process.argv[2] || "all";

  runSelectedSqlSmokeSuite({ suite }).catch((error) => {
    process.stderr.write(`\n[sql-smoke] ${error.message}\n`);
    process.exitCode = 1;
  });
}
