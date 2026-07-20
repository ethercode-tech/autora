import { access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { loadResolvedEnv } from "./load-project-env.mjs";

const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
];

const DEFAULT_CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function getLiveE2EReadiness({ env = process.env, cwd = process.cwd() } = {}) {
  const resolvedEnv = await loadResolvedEnv(env, cwd);
  const chromePath = resolvedEnv.PLAYWRIGHT_CHROME_PATH || DEFAULT_CHROME_PATH;
  const missingEnvKeys = REQUIRED_ENV_KEYS.filter((key) => !resolvedEnv[key]);
  const chromeAvailable = await fileExists(chromePath);
  const manufacturerSpec = path.resolve(cwd, "tests/e2e/live-manufacturer-flow.spec.ts");
  const resellerSpec = path.resolve(cwd, "tests/e2e/live-reseller-flow.spec.ts");

  return {
    ready: missingEnvKeys.length === 0 && chromeAvailable,
    missingEnvKeys,
    chromePath,
    chromeAvailable,
    specsPresent: (await fileExists(manufacturerSpec)) && (await fileExists(resellerSpec))
  };
}

export function formatLiveE2EReadinessSummary(readiness) {
  const lines = [
    `[live-e2e:check] ready=${readiness.ready ? "yes" : "no"}`,
    `[live-e2e:check] chrome=${readiness.chromeAvailable ? "ok" : "missing"} (${readiness.chromePath})`,
    `[live-e2e:check] specs=${readiness.specsPresent ? "ok" : "missing"}`
  ];

  if (readiness.missingEnvKeys.length > 0) {
    lines.push(`[live-e2e:check] missing env: ${readiness.missingEnvKeys.join(", ")}`);
  }

  if (readiness.ready) {
    lines.push("[live-e2e:check] You can run: pnpm test:e2e:live");
  }

  return lines.join("\n");
}

export async function runLiveE2EReadinessCheck(options = {}) {
  const readiness = await getLiveE2EReadiness(options);
  process.stdout.write(`${formatLiveE2EReadinessSummary(readiness)}\n`);

  if (!readiness.ready) {
    process.exitCode = 1;
  }

  return readiness;
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runLiveE2EReadinessCheck().catch((error) => {
    process.stderr.write(`[live-e2e:check] ${error.message}\n`);
    process.exitCode = 1;
  });
}
