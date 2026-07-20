import path from "node:path";
import process from "node:process";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import { getLiveE2EReadiness } from "./check-live-e2e-readiness.mjs";
import { getSqlSmokeReadiness } from "./check-sql-smoke-readiness.mjs";
import { loadResolvedEnv } from "./load-project-env.mjs";
import { isPostgresConnectionString, resolveDatabaseUrl } from "./run-sql-smoke.mjs";

const REQUIRED_RELEASE_ENV_KEYS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
];

export async function readHostingConfig(cwd = process.cwd()) {
  const hostingConfigPath = path.resolve(cwd, ".openai", "hosting.json");

  try {
    await access(hostingConfigPath, constants.F_OK);
  } catch {
    return {
      exists: false,
      projectId: null,
      path: hostingConfigPath
    };
  }

  const rawConfig = await readFile(hostingConfigPath, "utf8");
  const parsedConfig = JSON.parse(rawConfig);
  const projectId = typeof parsedConfig.project_id === "string" && parsedConfig.project_id.length > 0 ? parsedConfig.project_id : null;

  return {
    exists: true,
    projectId,
    path: hostingConfigPath
  };
}

export async function getReleaseReadiness({ env = process.env, cwd = process.cwd() } = {}) {
  const resolvedEnv = await loadResolvedEnv(env, cwd);
  const liveE2E = await getLiveE2EReadiness({ env: resolvedEnv, cwd });
  const sqlSmoke = await getSqlSmokeReadiness({ env: resolvedEnv, cwd });
  const hostingConfig = await readHostingConfig(cwd);
  const missingReleaseEnvKeys = REQUIRED_RELEASE_ENV_KEYS.filter((key) => !resolvedEnv[key]);
  const configuredDatabaseUrl = resolveDatabaseUrl(resolvedEnv);
  const hasDirectDatabaseUrl = isPostgresConnectionString(configuredDatabaseUrl);
  const hasHostingConfig = hostingConfig.exists && Boolean(hostingConfig.projectId);

  return {
    ready: missingReleaseEnvKeys.length === 0 && liveE2E.ready && sqlSmoke.ready && hasHostingConfig,
    missingReleaseEnvKeys,
    hasDirectDatabaseUrl,
    hasHostingConfig,
    hostingConfig,
    liveE2E,
    sqlSmoke
  };
}

export function formatReleaseReadinessSummary(readiness) {
  const lines = [
    `[release:check] ready=${readiness.ready ? "yes" : "no"}`,
    `[release:check] live-e2e=${readiness.liveE2E.ready ? "ok" : "blocked"}`,
    `[release:check] sql-smoke=${readiness.sqlSmoke.ready ? "ok" : "blocked"}`,
    `[release:check] direct-db-url=${readiness.hasDirectDatabaseUrl ? "present" : "missing"}`,
    `[release:check] hosting-config=${readiness.hasHostingConfig ? "present" : "missing"}`
  ];

  if (readiness.missingReleaseEnvKeys.length > 0) {
    lines.push(`[release:check] missing env: ${readiness.missingReleaseEnvKeys.join(", ")}`);
  }

  if (readiness.sqlSmoke.missingEnvKeys.length > 0) {
    lines.push(`[release:check] sql blockers: ${readiness.sqlSmoke.missingEnvKeys.join(", ")}`);
  }

  if (readiness.sqlSmoke.expectedDirectUrlExample && readiness.sqlSmoke.missingEnvKeys.some((key) => key.includes("SUPABASE_DB_URL or DATABASE_URL"))) {
    lines.push(`[release:check] expected direct url example: ${readiness.sqlSmoke.expectedDirectUrlExample}`);
  }

  if (!readiness.liveE2E.chromeAvailable) {
    lines.push(`[release:check] live-e2e blocker: chrome missing at ${readiness.liveE2E.chromePath}`);
  }

  if (!readiness.hasHostingConfig) {
    lines.push(
      readiness.hostingConfig?.exists
        ? "[release:check] deploy blocker: .openai/hosting.json exists but project_id is missing."
        : "[release:check] deploy blocker: .openai/hosting.json is not present in this workspace."
    );
  }

  if (readiness.ready) {
    lines.push("[release:check] You can run: pnpm test:e2e:live && pnpm test:sql-smoke");
  }

  return lines.join("\n");
}

export async function runReleaseReadinessCheck(options = {}) {
  const readiness = await getReleaseReadiness(options);
  process.stdout.write(`${formatReleaseReadinessSummary(readiness)}\n`);

  if (!readiness.ready) {
    process.exitCode = 1;
  }

  return readiness;
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runReleaseReadinessCheck().catch((error) => {
    process.stderr.write(`[release:check] ${error.message}\n`);
    process.exitCode = 1;
  });
}
