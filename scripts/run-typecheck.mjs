import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = path.resolve(scriptDirectory, "..");

function resolveProjectPath(...segments) {
  return path.join(defaultProjectRoot, ...segments);
}

export const TYPECHECK_COMMANDS = [
  {
    label: "typecheck:clean",
    kind: "cleanup"
  },
  {
    label: "typecheck:typegen",
    command: process.execPath,
    args: [resolveProjectPath("node_modules", "next", "dist", "bin", "next"), "typegen"]
  },
  {
    label: "typecheck:tsc",
    command: process.execPath,
    args: [resolveProjectPath("node_modules", "typescript", "bin", "tsc"), "--noEmit"]
  }
];

export function formatTypecheckSummary(labels = TYPECHECK_COMMANDS.map((entry) => entry.label)) {
  return `[typecheck] steps=${labels.join(", ")}`;
}

async function cleanupGeneratedTypes(cwd) {
  const generatedTypesPath = path.resolve(cwd, ".next", "types");
  await rm(generatedTypesPath, {
    force: true,
    recursive: true
  });
}

function runCommandStep({ label, command, args, cwd, env }) {
  return new Promise((resolve, reject) => {
    process.stdout.write(`[typecheck] running ${label}\n`);

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

export async function runTypecheck({
  cwd = process.cwd(),
  env = process.env,
  commands = TYPECHECK_COMMANDS
} = {}) {
  process.stdout.write(`${formatTypecheckSummary(commands.map((entry) => entry.label))}\n`);

  for (const entry of commands) {
    if (entry.kind === "cleanup") {
      process.stdout.write(`[typecheck] running ${entry.label}\n`);
      await cleanupGeneratedTypes(cwd);
      continue;
    }

    await runCommandStep({
      ...entry,
      cwd,
      env
    });
  }

  process.stdout.write("[typecheck] completed successfully.\n");
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runTypecheck().catch((error) => {
    process.stderr.write(`[typecheck] ${error.message}\n`);
    process.exitCode = 1;
  });
}
