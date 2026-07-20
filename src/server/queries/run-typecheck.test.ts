import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type TypecheckModule = {
  TYPECHECK_COMMANDS: Array<{
    label: string;
    kind?: string;
    command?: string;
    args?: string[];
  }>;
  formatTypecheckSummary: (labels?: string[]) => string;
};

let typecheckModule: TypecheckModule;

beforeAll(async () => {
  typecheckModule = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "run-typecheck.mjs")).href)) as TypecheckModule;
});

describe("run typecheck helpers", () => {
  it("exposes the expected typecheck sequence", () => {
    expect(typecheckModule.TYPECHECK_COMMANDS.map((entry) => entry.label)).toEqual([
      "typecheck:clean",
      "typecheck:typegen",
      "typecheck:tsc"
    ]);
    expect(typecheckModule.TYPECHECK_COMMANDS[0]?.kind).toBe("cleanup");
    expect(typecheckModule.TYPECHECK_COMMANDS[1]?.args).toEqual(expect.arrayContaining(["typegen"]));
    expect(typecheckModule.TYPECHECK_COMMANDS[2]?.args?.slice(-1)).toEqual(["--noEmit"]);
  });

  it("formats a readable typecheck summary", () => {
    expect(typecheckModule.formatTypecheckSummary()).toBe("[typecheck] steps=typecheck:clean, typecheck:typegen, typecheck:tsc");
  });
});
