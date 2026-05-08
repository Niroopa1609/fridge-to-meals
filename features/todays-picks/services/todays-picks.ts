import { apiFetch } from "@/lib/api"
import { getRequestId } from "@/lib/request-id"
import type { BackendRecipe } from "@/features/recipe-generator/types"

export type TodayPicksResponse = {
  recipes: BackendRecipe[]
  warnings: string[]
}

export async function fetchTodayPicks(accessToken: string, refresh: boolean): Promise<TodayPicksResponse> {
  const requestId = getRequestId()
  const query = refresh ? "?refresh=true" : ""
  const { res } = await apiFetch(`/api/recipes/today${query}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    requestId,
    safeLogFields: { refresh: refresh ? 1 : 0 },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message || body?.error || `Fetch failed: ${res.status}`)
  }
  return (await res.json()) as TodayPicksResponse
}

