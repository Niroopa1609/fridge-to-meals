import { getRequestId } from "@/lib/request-id"
import { logError, logInfo } from "@/lib/logger"

type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  requestId?: string
  headers?: Record<string, string>
  safeLogFields?: Record<string, unknown>
}

function resolveUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  if (typeof window !== "undefined") {
    return p
  }
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "")
  return `${base}${p}`
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const requestId = options.requestId ?? getRequestId()
  const url = resolveUrl(path)

  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
    "X-Request-Id": requestId,
  }

  logInfo("api.request.start", requestId, { method: options.method ?? "GET", path, ...(options.safeLogFields ?? {}) })

  try {
    const res = await fetch(url, { ...options, headers })
    logInfo("api.request.end", requestId, { method: options.method ?? "GET", path, status: res.status })

    if (
      typeof window !== "undefined" &&
      (res.status === 401 || res.status === 403) &&
      !path.startsWith("/api/auth") &&
      path !== "/api/logs/frontend"
    ) {
      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", {
          detail: { path, status: res.status, requestId },
        })
      )
    }

    return { res, requestId }
  } catch (e) {
    const errName = e instanceof Error ? e.name : "Unknown"
    const errMessage = e instanceof Error ? e.message : String(e)
    const isTransientNetwork =
      errName === "TypeError" &&
      (errMessage === "Failed to fetch" ||
        errMessage.includes("NetworkError") ||
        errMessage.includes("Load failed"))
    if (isTransientNetwork) {
      logInfo("api.request.network_error", requestId, {
        method: options.method ?? "GET",
        path,
        errorName: errName,
        errorMessage: errMessage,
      })
    } else {
      logError("api.request.error", requestId, {
        method: options.method ?? "GET",
        path,
        errorName: errName,
        errorMessage: errMessage,
      })
    }
    throw e
  }
}
