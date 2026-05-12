import type { BackendRecipe } from "@/features/recipe-generator/types"

type LooseRecipe = {
  id?: unknown
  title?: unknown
  image?: unknown
  mealType?: unknown
  difficulty?: unknown
  time?: unknown
  servings?: unknown
  ingredients?: unknown
  instructions?: unknown
  proTips?: unknown
  nutrition?: unknown
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => String(x))
}

function mapRecipe(r: LooseRecipe): BackendRecipe {
  const n = r.nutrition && typeof r.nutrition === "object" ? (r.nutrition as Record<string, unknown>) : {}
  return {
    id: String(r.id ?? ""),
    title: String(r.title ?? ""),
    image: String(r.image ?? ""),
    mealType: String(r.mealType ?? ""),
    difficulty: String(r.difficulty ?? "EASY"),
    time: String(r.time ?? ""),
    servings: Number(r.servings ?? 2),
    isVegetarian: Boolean((r as { isVegetarian?: unknown }).isVegetarian),
    description: String((r as { description?: unknown }).description ?? ""),
    ingredients: asStringArray(r.ingredients),
    instructions: asStringArray(r.instructions),
    proTips: asStringArray(r.proTips),
    nutrition: {
      calories: Number(n.calories ?? 0),
      protein: String(n.protein ?? ""),
      carbs: String(n.carbs ?? ""),
      fat: String(n.fat ?? ""),
    },
  }
}

export function parseRecipeResponseJson(jsonText: string): { recipes: BackendRecipe[] } {
  let trimmed = jsonText.trim()
  if (trimmed.startsWith("```")) {
    const firstNl = trimmed.indexOf("\n")
    if (firstNl > 0) trimmed = trimmed.slice(firstNl + 1)
    const fence = trimmed.lastIndexOf("```")
    if (fence >= 0) trimmed = trimmed.slice(0, fence)
    trimmed = trimmed.trim()
  }
  const parsed = JSON.parse(trimmed) as { recipes?: unknown }
  if (!parsed || !Array.isArray(parsed.recipes)) {
    throw new Error("Failed to parse recipe JSON")
  }
  return { recipes: (parsed.recipes as LooseRecipe[]).map(mapRecipe) }
}
