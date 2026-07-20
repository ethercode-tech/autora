import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SOURCE_ROOT = path.resolve(process.cwd(), "src");
const IGNORED_DIRECTORIES = new Set(["node_modules", ".next"]);
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const EXCLUDED_FILES = new Set([
  path.resolve(process.cwd(), "src/architecture/storage-boundary.test.ts"),
]);

function collectSourceFiles(directoryPath: string): string[] {
  const entries = readdirSync(directoryPath);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry)) {
        files.push(...collectSourceFiles(fullPath));
      }

      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry))) {
      if (!EXCLUDED_FILES.has(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

describe("storage boundary", () => {
  it("does not depend on browser storage as a source of truth", () => {
    const offenders: string[] = [];

    for (const filePath of collectSourceFiles(SOURCE_ROOT)) {
      const content = readFileSync(filePath, "utf8");

      if (content.includes("localStorage") || content.includes("sessionStorage")) {
        offenders.push(path.relative(process.cwd(), filePath));
      }
    }

    expect(offenders).toEqual([]);
  });
});
