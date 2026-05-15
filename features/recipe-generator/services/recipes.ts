import type { GenerateRecipesResponse, RecipeGeneratorPayload } from "@/features/recipe-generator/types"
import { apiFetch } from "@/lib/api"

export async function generateRecipes(
  payload: RecipeGeneratorPayload,
  requestId: string,
  signal?: AbortSignal
): Promise<GenerateRecipesResponse> {
  const { res: response } = await apiFetch("/api/recipes/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    requestId,
    signal,
    safeLogFields: {
      ingredientsCount: Array.isArray(payload.ingredients) ? payload.ingredients.length : 0,
      mealTypeCount: Array.isArray(payload.mealTypes) ? payload.mealTypes.length : 0,
      cuisine: payload.cuisine,
      cookingStyle: payload.cookingStyle,
      mealPrepTime: payload.mealPrepTime,
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as GenerateRecipesResponse
}

