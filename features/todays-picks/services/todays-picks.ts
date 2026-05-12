import { apiFetch } from "@/lib/api"
import { getRequestId } from "@/lib/request-id"
import type { BackendRecipe } from "@/features/recipe-generator/types"

export type TodayPicksResponse = {
  recipes: BackendRecipe[]
  warnings: string[]
}

export async function fetchTodayPicks(accessToken: string, refresh: boolean): Promise<TodayPicksResponse> {
  const requestId = getRequestId()
  if (refresh) {
    const { res } = await apiFetch("/api/recipes/today/refresh", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      requestId,
      safeLogFields: { refresh: 1 },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.message || body?.error || `Fetch failed: ${res.status}`)
    }
    return (await res.json()) as TodayPicksResponse
  }
  const { res } = await apiFetch("/api/recipes/today", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    requestId,
    safeLogFields: { refresh: 0 },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message || body?.error || `Fetch failed: ${res.status}`)
  }
  return (await res.json()) as TodayPicksResponse
}
