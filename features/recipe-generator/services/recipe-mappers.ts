import type { Recipe } from "@/components/recipe-card"
import type { BackendRecipe } from "@/features/recipe-generator/types"

function safeDifficulty(value: unknown): "EASY" | "MEDIUM" | "HARD" {
  const v = String(value || "").toUpperCase()
  if (v === "MEDIUM") return "MEDIUM"
  if (v === "HARD") return "HARD"
  return "EASY"
}

export function normalizeBackendRecipe(r: BackendRecipe): Recipe {
  return {
    id: String((r as any)?.id || crypto.randomUUID()),
    title: String((r as any)?.title || "Untitled Recipe"),
    image: String(
      (r as any)?.imageUrl ||
      (r as any)?.image ||
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop"
    ),
    mealType: String((r as any)?.mealType || "").toUpperCase(),
    difficulty: safeDifficulty((r as any)?.difficulty),
    time: String((r as any)?.time || ""),
    servings: Number((r as any)?.servings || 2),
    isVegetarian: Boolean((r as any)?.isVegetarian),
    description: String((r as any)?.description || ""),
    ingredients: Array.isArray((r as any)?.ingredients) ? (r as any).ingredients.map(String) : [],
    instructions: Array.isArray((r as any)?.instructions) ? (r as any).instructions.map(String) : [],
    proTips: Array.isArray((r as any)?.proTips) ? (r as any).proTips.map(String) : [],
    nutrition: {
      calories: Number((r as any)?.nutrition?.calories || 0),
      protein: String((r as any)?.nutrition?.protein || ""),
      carbs: String((r as any)?.nutrition?.carbs || ""),
      fat: String((r as any)?.nutrition?.fat || ""),
    },
  }
}

