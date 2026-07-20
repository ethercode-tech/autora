import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { loadResolvedEnv } from "./load-project-env.mjs";
import { resolvePsqlBinary, resolveValidatedDatabaseUrl, runPsqlFile } from "./run-sql-smoke.mjs";

export function resolveSqlFileArguments(args = process.argv.slice(2)) {
  const files = args.filter(Boolean);

  if (files.length === 0) {
    throw new Error("Pass one or more SQL files to apply. Example: node ./scripts/apply-sql-files.mjs supabase/migrations/202607200004_admin_commercial_rls.sql");
  }

  return files;
}

export function buildAppliedFilesSummary(files) {
  return `[apply-sql] applying ${files.length} file(s): ${files.join(", ")}`;
}

export async function applySqlFiles({
  files = resolveSqlFileArguments(),
  cwd = process.cwd(),
  env = process.env
} = {}) {
  const resolvedEnv = await loadResolvedEnv(env, cwd);
  const databaseUrl = resolveValidatedDatabaseUrl(resolvedEnv);

  if (!databaseUrl) {
    throw new Error("Missing SUPABASE_DB_URL or DATABASE_URL. Set one of them before applying SQL files.");
  }

  const psqlPath = resolvePsqlBinary(resolvedEnv);
  process.stdout.write(`${buildAppliedFilesSummary(files)}\n`);

  for (const relativeFilePath of files) {
    const sqlFilePath = path.resolve(cwd, relativeFilePath);
    process.stdout.write(`[apply-sql] running ${relativeFilePath}\n`);
    await runPsqlFile({
      psqlPath,
      databaseUrl,
      sqlFilePath,
      cwd
    });
  }

  process.stdout.write("[apply-sql] completed successfully.\n");
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  applySqlFiles().catch((error) => {
    process.stderr.write(`[apply-sql] ${error.message}\n`);
    process.exitCode = 1;
  });
}
