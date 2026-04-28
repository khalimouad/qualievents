/**
 * Tiny structured logger.
 *
 * In production, emits a single JSON line per event so log aggregators
 * (Vercel, Datadog, anything that ingests stdout) can index the fields.
 * In dev, prints a coloured one-liner with the message + JSON tail so
 * humans can scan the terminal quickly.
 *
 * No external dependency. Drop-in replacement for `console.error("[area]…", err)`:
 *   logger.error("payments.notify", "signature mismatch", { txId });
 */

type Level = "debug" | "info" | "warn" | "error";

interface LogFields {
  /** Bag of extra fields to attach. Errors are unwrapped to {message, stack}. */
  [key: string]: unknown;
}

const isProd = process.env.NODE_ENV === "production";

function unwrapError(err: unknown): { message: string; stack?: string; name?: string } {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { message: String(err) };
}

function emit(level: Level, area: string, message: string, fields?: LogFields) {
  // Pull out an `error` field and serialise it consistently so stack traces
  // survive JSON.stringify().
  let extra: Record<string, unknown> | undefined;
  if (fields) {
    extra = { ...fields };
    if ("error" in extra) extra.error = unwrapError(extra.error);
  }

  if (isProd) {
    const record = {
      ts: new Date().toISOString(),
      level,
      area,
      msg: message,
      ...extra,
    };
    // eslint-disable-next-line no-console
    (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(
      JSON.stringify(record)
    );
    return;
  }

  // Dev: human-readable
  const tail = extra && Object.keys(extra).length ? " " + JSON.stringify(extra) : "";
  const prefix = `[${area}]`;
  // eslint-disable-next-line no-console
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  fn(`${prefix} ${message}${tail}`);
}

export const logger = {
  debug: (area: string, message: string, fields?: LogFields) => emit("debug", area, message, fields),
  info: (area: string, message: string, fields?: LogFields) => emit("info", area, message, fields),
  warn: (area: string, message: string, fields?: LogFields) => emit("warn", area, message, fields),
  error: (area: string, message: string, fields?: LogFields) => emit("error", area, message, fields),
};
