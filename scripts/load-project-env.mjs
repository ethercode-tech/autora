import { readFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_ENV_FILES = [".env", ".env.local"];

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

export function parseDotEnv(content) {
  const parsed = {};

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim());

    if (!key) {
      continue;
    }

    parsed[key] = value;
  }

  return parsed;
}

export async function loadProjectEnvFiles(cwd = process.cwd()) {
  const envFromFiles = {};

  for (const fileName of PROJECT_ENV_FILES) {
    const filePath = path.resolve(cwd, fileName);

    try {
      const content = await readFile(filePath, "utf8");
      Object.assign(envFromFiles, parseDotEnv(content));
    } catch {
      // Missing env files are optional for local tooling.
    }
  }

  return envFromFiles;
}

export async function loadResolvedEnv(env = process.env, cwd = process.cwd()) {
  const envFromFiles = await loadProjectEnvFiles(cwd);

  return {
    ...envFromFiles,
    ...env
  };
}
