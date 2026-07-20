import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = path.resolve(scriptDirectory, "..");

function resolveProjectPath(...segments) {
  return path.join(defaultProjectRoot, ...segments);
}

export const BASELINE_COMMANDS = [
  { label: "lint", command: process.execPath, args: [resolveProjectPath("node_modules", "eslint", "bin", "eslint.js"), ".", "--max-warnings=0"] },
  {
    label: "typecheck",
    command: process.execPath,
    args: [resolveProjectPath("scripts", "run-typecheck.mjs")]
  },
  { label: "test", command: process.execPath, args: [resolveProjectPath("node_modules", "vitest", "vitest.mjs"), "run"] },
  { label: "build", command: process.execPath, args: [resolveProjectPath("node_modules", "next", "dist", "bin", "next"), "build"] }
];

export function formatBaselineSummary(labels = BASELINE_COMMANDS.map((entry) => entry.label)) {
  return `[baseline] commands=${labels.join(", ")}`;
}

function runCommandStep({ label, command, args, cwd, env }) {
  return new Promise((resolve, reject) => {
    process.stdout.write(`[baseline] running ${label}\n`);

    const child = spawn(command, args, {
      cwd,
      env,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`${label} exited with code ${code ?? "unknown"}.`));
    });
  });
}

export async function runBaselineChecks({
  cwd = process.cwd(),
  env = process.env,
  commands = BASELINE_COMMANDS
} = {}) {
  process.stdout.write(`${formatBaselineSummary(commands.map((entry) => entry.label))}\n`);

  for (const entry of commands) {
    await runCommandStep({
      ...entry,
      cwd,
      env
    });
  }

  process.stdout.write("[baseline] completed successfully.\n");
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runBaselineChecks().catch((error) => {
    process.stderr.write(`[baseline] ${error.message}\n`);
    process.exitCode = 1;
  });
}
