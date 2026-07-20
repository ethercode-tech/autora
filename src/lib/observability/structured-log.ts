export type StructuredLogLevel = "info" | "warn" | "error";

export type StructuredLogContext = Record<string, unknown>;

export type StructuredLogEntry = {
  timestamp: string;
  level: StructuredLogLevel;
  event: string;
  context: StructuredLogContext;
};

type StructuredLogSink = Pick<Console, "info" | "warn" | "error">;

export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  return { message: "Unknown error", details: error };
}

export function buildStructuredLogEntry(level: StructuredLogLevel, event: string, context: StructuredLogContext = {}): StructuredLogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    event,
    context
  };
}

export function writeStructuredLog(
  level: StructuredLogLevel,
  event: string,
  context: StructuredLogContext = {},
  sink: StructuredLogSink = console
) {
  const entry = buildStructuredLogEntry(level, event, context);
  const message = JSON.stringify(entry);

  if (level === "error") {
    sink.error(message);
    return entry;
  }

  if (level === "warn") {
    sink.warn(message);
    return entry;
  }

  sink.info(message);
  return entry;
}
