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
}
