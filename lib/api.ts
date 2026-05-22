import { isAbortError } from "@/lib/abort"
import { getRequestId } from "@/lib/request-id"
import { logError, logInfo } from "@/lib/logger"
import { getClientAccessToken, tryRefreshSession } from "@/lib/auth-session-client"

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

function isAuthPath(path: string): boolean {
  return path.startsWith("/api/auth") || path === "/api/logs/frontend"
}

function withUpdatedAuthHeader(headers: Record<string, string>): Record<string, string> {
  const token = getClientAccessToken()
  if (!token) return headers
  if (!headers.Authorization && !headers.authorization) return headers
  return { ...headers, Authorization: `Bearer ${token}` }
}

async function fetchWithAuthRetry(
  url: string,
  options: ApiFetchOptions,
  headers: Record<string, string>,
  requestId: string,
  path: string
): Promise<Response> {
  const res = await fetch(url, { ...options, headers })

  if (
    typeof window === "undefined" ||
    isAuthPath(path) ||
    (res.status !== 401 && res.status !== 403)
  ) {
    return res
  }

  const refreshed = await tryRefreshSession()
  if (!refreshed) return res

  const retryHeaders = withUpdatedAuthHeader(headers)
  return fetch(url, { ...options, headers: retryHeaders })
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
    let res = await fetchWithAuthRetry(url, options, headers, requestId, path)
    logInfo("api.request.end", requestId, { method: options.method ?? "GET", path, status: res.status })

    if (
      typeof window !== "undefined" &&
      (res.status === 401 || res.status === 403) &&
      !isAuthPath(path)
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
    if (isAbortError(e)) {
      logInfo("api.request.aborted", requestId, {
        method: options.method ?? "GET",
        path,
      })
    } else if (isTransientNetwork) {
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
