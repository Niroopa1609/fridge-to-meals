import type { SupabaseClient } from "@supabase/supabase-js"
import { findRecipesByIngredients } from "@/lib/server/recipe-catalog"
import type { TodayPickRecipeOut } from "@/lib/server/todays-picks"
import type { BackendRecipe } from "@/features/recipe-generator/types"

export async function findTodayPicksFromCatalog(
  supabase: SupabaseClient,
  chosenByMeal: Record<string, string[]>,
  preferredCuisines: string[],
  avoidTitles: string[]
): Promise<{ recipes: TodayPickRecipeOut[]; catalogCount: number }> {
  const meals = ["Breakfast", "Lunch", "Dinner"] as const
  const picked: TodayPickRecipeOut[] = []
  const usedTitles = new Set(avoidTitles.map((t) => t.trim().toLowerCase()))
  const usedSlugs: string[] = []

  for (let i = 0; i < meals.length; i++) {
    const meal = meals[i]!
    const ingredients = chosenByMeal[meal] || []
    if (!ingredients.length) continue

    const cuisine =
      preferredCuisines.length > 0
        ? preferredCuisines[i % preferredCuisines.length]!
        : null

    const hits = await findRecipesByIngredients(
      supabase,
      {
        ingredients,
        cuisine,
        mealPrepTime: null,
        cookingStyle: null,
        mealTypes: [meal],
      },
      {
        perMealType: 1,
        excludeTitles: [...usedTitles],
        excludeSlugs: usedSlugs,
      }
    )

    if (hits.length === 0) continue
    const r = hits[0]!
    usedTitles.add(r.title.trim().toLowerCase())
    if (r.id.startsWith("catalog-")) {
      usedSlugs.push(r.id.slice("catalog-".length))
    }

    picked.push(backendToTodayPick(r, meal))
  }

  return { recipes: picked, catalogCount: picked.length }
}

function backendToTodayPick(r: BackendRecipe, mealType: string): TodayPickRecipeOut {
  return {
    id: r.id || `today-${mealType.toLowerCase()}`,
    title: r.title,
    mealType: r.mealType || mealType,
    difficulty: r.difficulty,
    time: r.time,
    servings: r.servings,
    isVegetarian: r.isVegetarian,
    description: r.description,
    ingredients: r.ingredients,
    instructions: r.instructions,
    proTips: r.proTips,
    nutrition: r.nutrition,
    imageUrl: r.image,
    imageAlt: "",
    photographer: "",
    photographerUrl: "",
  }
}
