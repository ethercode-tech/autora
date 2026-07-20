import path from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

type BaselineModule = {
  BASELINE_COMMANDS: Array<{
    label: string;
    command: string;
    args: string[];
    preCommands?: Array<{
      command: string;
      args: string[];
    }>;
  }>;
  formatBaselineSummary: (labels?: string[]) => string;
};

let baselineModule: BaselineModule;

beforeAll(async () => {
  baselineModule = (await import(pathToFileURL(path.resolve(process.cwd(), "scripts", "run-baseline-checks.mjs")).href)) as BaselineModule;
});

describe("run baseline checks helpers", () => {
  it("exposes the expected command sequence", () => {
    expect(baselineModule.BASELINE_COMMANDS.map((entry) => entry.label)).toEqual(["lint", "typecheck", "test", "build"]);
    expect(baselineModule.BASELINE_COMMANDS[0]?.args.slice(-2)).toEqual([".", "--max-warnings=0"]);
    expect(baselineModule.BASELINE_COMMANDS[1]?.args.slice(-1)).toEqual(["--noEmit"]);
    expect(baselineModule.BASELINE_COMMANDS[1]?.preCommands).toEqual([
      expect.objectContaining({
        args: expect.arrayContaining(["typegen"])
      })
    ]);
    expect(baselineModule.BASELINE_COMMANDS[2]?.args.slice(-1)).toEqual(["run"]);
    expect(baselineModule.BASELINE_COMMANDS[3]?.args.slice(-1)).toEqual(["build"]);
  });

  it("formats a readable baseline summary", () => {
    expect(baselineModule.formatBaselineSummary()).toBe("[baseline] commands=lint, typecheck, test, build");
  });

  it("formats a summary for a custom label list", () => {
    expect(baselineModule.formatBaselineSummary(["lint", "build"])).toBe("[baseline] commands=lint, build");
  });
});
