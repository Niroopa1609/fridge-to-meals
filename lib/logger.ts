export type LogLevel = "info" | "error"

export function logInfo(message: string, requestId: string, fields?: Record<string, unknown>) {
  log("info", message, requestId, fields)
}

export function logError(message: string, requestId: string, fields?: Record<string, unknown>) {
  log("error", message, requestId, fields)
}

function log(level: LogLevel, message: string, requestId: string, fields?: Record<string, unknown>) {
  const payload = fields ? { requestId, ...fields } : { requestId }
  if (level === "error") {
    console.error(message, payload)
  } else {
    console.info(message, payload)
  }

  // Frontend can't write files directly; send logs to backend for daily file logging.
  void sendToBackend(level, message, payload)
}

async function sendToBackend(level: LogLevel, message: string, context: Record<string, unknown>) {
  // Avoid SSR / build-time execution.
  if (typeof window === "undefined") return

  try {
    await fetch("http://localhost:8080/api/logs/frontend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": String(context.requestId ?? ""),
      },
      body: JSON.stringify({
        level: level.toUpperCase(),
        message,
        timestamp: new Date().toISOString(),
        context,
      }),
      keepalive: true,
    })
  } catch {
    // Never throw from logging.
  }
}

