import { describe, expect, it, vi } from "vitest";
import { buildStructuredLogEntry, serializeError, writeStructuredLog } from "@/lib/observability/structured-log";

describe("structured log", () => {
  it("builds stable log entries with timestamp, level and context", () => {
    const entry = buildStructuredLogEntry("info", "operation.completed", {
      action: "createSale",
      success: true
    });

    expect(entry.level).toBe("info");
    expect(entry.event).toBe("operation.completed");
    expect(entry.context).toEqual({
      action: "createSale",
      success: true
    });
    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false);
  });

  it("serializes error instances into safe plain objects", () => {
    const serialized = serializeError(new Error("boom"));

    expect(serialized).toMatchObject({
      name: "Error",
      message: "boom"
    });
  });

  it("writes json logs through the correct sink method", () => {
    const sink = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    const entry = writeStructuredLog("warn", "inventory.low_stock", { resourceId: "res-1" }, sink);

    expect(entry.level).toBe("warn");
    expect(sink.warn).toHaveBeenCalledTimes(1);
    expect(sink.info).not.toHaveBeenCalled();
    expect(sink.error).not.toHaveBeenCalled();
    expect(() => JSON.parse(sink.warn.mock.calls[0][0] as string)).not.toThrow();
  });
});
