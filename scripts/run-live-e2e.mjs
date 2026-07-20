import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { getLiveE2EReadiness } from "./check-live-e2e-readiness.mjs";
import { loadResolvedEnv } from "./load-project-env.mjs";

export const LIVE_E2E_SUITES = {
  manufacturer: ["tests/e2e/live-manufacturer-flow.spec.ts"],
  reseller: ["tests/e2e/live-reseller-flow.spec.ts"],
  all: ["tests/e2e/live-manufacturer-flow.spec.ts", "tests/e2e/live-reseller-flow.spec.ts"]
};

export function resolveRequestedSuite(args = process.argv.slice(2)) {
  const candidate = args[0] || "all";

  if (!(candidate in LIVE_E2E_SUITES)) {
    throw new Error(`Unknown live E2E suite "${candidate}". Use one of: ${Object.keys(LIVE_E2E_SUITES).join(", ")}`);
  }

  return candidate;
}

export function buildLiveE2ERunEnv(resolvedEnv) {
  const runEnv = {
    ...resolvedEnv,
    E2E_LIVE_SUPABASE: "1",
    E2E_USE_PROD_SERVER: "1",
    PLAYWRIGHT_PORT: resolvedEnv.PLAYWRIGHT_PORT || "3100"
  };

  if (resolvedEnv.E2E_EXTERNAL_BASE_URL) {
    runEnv.E2E_EXTERNAL_BASE_URL = resolvedEnv.E2E_EXTERNAL_BASE_URL;
  }

  return runEnv;
}

function spawnPlaywrightRun({ specFile, env, cwd }) {
  return new Promise((resolve, reject) => {
    const playwrightLauncher = process.platform === "win32" ? path.resolve(cwd, "node_modules/.bin/playwright.CMD") : path.resolve(cwd, "node_modules/.bin/playwright");
    const child = spawn(playwrightLauncher, ["test", specFile], {
      cwd,
      env,
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`Playwright exited with code ${code ?? "unknown"} while running ${specFile}.`));
    });
  });
}

function spawnNextBuild({ env, cwd }) {
  return new Promise((resolve, reject) => {
    const nextBinPath = path.resolve(cwd, "node_modules/next/dist/bin/next");
    const child = spawn(process.execPath, [nextBinPath, "build"], {
      cwd,
      env,
      stdio: "inherit",
      shell: false
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`Next build exited with code ${code ?? "unknown"}.`));
    });
  });
}

export async function runLiveE2E({
  suite = resolveRequestedSuite(),
  cwd = process.cwd(),
  env = process.env
} = {}) {
  const readiness = await getLiveE2EReadiness({ env, cwd });

  if (!readiness.ready) {
    throw new Error("Live E2E readiness check failed. Run `pnpm test:e2e:live:check` first.");
  }

  const resolvedEnv = await loadResolvedEnv(env, cwd);
  const runEnv = buildLiveE2ERunEnv(resolvedEnv);

  process.stdout.write(`[live-e2e] suite=${suite}\n`);
  process.stdout.write(
    runEnv.E2E_EXTERNAL_BASE_URL
      ? `[live-e2e] using external base url ${runEnv.E2E_EXTERNAL_BASE_URL}\n`
      : "[live-e2e] building production bundle\n"
  );

  if (!runEnv.E2E_EXTERNAL_BASE_URL) {
    await spawnNextBuild({
      env: runEnv,
      cwd
    });
  }

  for (const specFile of LIVE_E2E_SUITES[suite]) {
    process.stdout.write(`[live-e2e] running ${specFile}\n`);
    await spawnPlaywrightRun({
      specFile,
      env: runEnv,
      cwd
    });
  }

  process.stdout.write("[live-e2e] completed successfully.\n");
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runLiveE2E().catch((error) => {
    process.stderr.write(`[live-e2e] ${error.message}\n`);
    process.exitCode = 1;
  });
}
