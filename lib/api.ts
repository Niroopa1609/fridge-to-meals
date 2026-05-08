import { getRequestId } from "@/lib/request-id"
import { logError, logInfo } from "@/lib/logger"

const API_BASE_URL = "http://localhost:8080"

type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  requestId?: string
  headers?: Record<string, string>
  safeLogFields?: Record<string, unknown>
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const requestId = options.requestId ?? getRequestId()
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`

  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
    "X-Request-Id": requestId,
  }

  logInfo("api.request.start", requestId, { method: options.method ?? "GET", path, ...(options.safeLogFields ?? {}) })

  try {
    const res = await fetch(url, { ...options, headers })
    logInfo("api.request.end", requestId, { method: options.method ?? "GET", path, status: res.status })

    // If the access token is stale/expired, prompt re-auth once.
    // Avoid doing this for auth endpoints to prevent loops.
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
    logError("api.request.error", requestId, { method: options.method ?? "GET", path })
    throw e
  }
}

