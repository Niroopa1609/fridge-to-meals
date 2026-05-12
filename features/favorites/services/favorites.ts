import type { Recipe } from "@/components/recipe-card"
import { apiFetch } from "@/lib/api"
import { getRequestId } from "@/lib/request-id"

export type SaveFavoritePayload = {
  recipe: Recipe
  title: string
  imageUrl: string
  mealType: string
  prepTime: string
  difficulty: string
  mainIngredients: string[]
  photographer?: string
  photographerUrl?: string
}

export async function saveFavorite(payload: SaveFavoritePayload, accessToken: string): Promise<{ id: string; saved: boolean }> {
  const requestId = getRequestId()
  const { res } = await apiFetch("/api/favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
    requestId,
    safeLogFields: { title: payload.title, mealType: payload.mealType, mainIngredientsCount: payload.mainIngredients?.length ?? 0 },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Save failed: ${res.status}`)
  }

  return (await res.json()) as { id: string; saved: boolean }
}

export type FavoriteDto = {
  id: string
  title: string
  imageUrl: string | null
  mealType: string
  prepTime: string | null
  difficulty: string | null
  mainIngredients: string | null
  recipeJson: any
  photographer: string | null
  photographerUrl: string | null
  createdAt: string
}

export async function fetchFavorites(accessToken: string): Promise<FavoriteDto[]> {
  const requestId = getRequestId()
  const { res } = await apiFetch("/api/favorites", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    requestId,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Fetch failed: ${res.status}`)
  }

  return (await res.json()) as FavoriteDto[]
}

export async function deleteFavorite(id: string, accessToken: string): Promise<void> {
  const requestId = getRequestId()
  const { res } = await apiFetch(`/api/favorites/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    requestId,
    safeLogFields: { favoriteId: id },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Delete failed: ${res.status}`)
  }
}
