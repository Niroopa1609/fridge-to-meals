import type { Recipe } from "@/components/recipe-card"
import type { FavoriteDto } from "@/features/favorites/services/favorites"
import type { BackendRecipe } from "@/features/recipe-generator/types"
import { normalizeBackendRecipe } from "@/features/recipe-generator/services/recipe-mappers"

/** Maps a saved favorite (and its stored JSON) into the planner `Recipe` shape used by `RecipeDetailMobileView` / `RecipeCard`. */
export function favoriteDtoToRecipe(f: FavoriteDto): Recipe {
  const raw =
    typeof f.recipeJson === "object" && f.recipeJson !== null
      ? (f.recipeJson as Partial<BackendRecipe> & Record<string, unknown>)
      : {}
  return normalizeBackendRecipe({
    ...raw,
    id: f.id,
    title: raw.title ?? f.title,
    image: raw.image ?? (raw as { imageUrl?: string }).imageUrl ?? f.imageUrl ?? "",
    mealType: raw.mealType ?? f.mealType,
    difficulty: raw.difficulty ?? f.difficulty ?? "EASY",
    time: raw.time ?? f.prepTime ?? "—",
    servings: typeof raw.servings === "number" ? raw.servings : Number(raw.servings) || 2,
    isVegetarian: Boolean(raw.isVegetarian),
    description: raw.description ?? "",
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients.map(String) : [],
    instructions: Array.isArray(raw.instructions) ? raw.instructions.map(String) : [],
    proTips: Array.isArray(raw.proTips) ? raw.proTips.map(String) : [],
    nutrition: raw.nutrition ?? {
      calories: 0,
      protein: "",
      carbs: "",
      fat: "",
    },
  } as BackendRecipe)
}
