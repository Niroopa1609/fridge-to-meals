import type { SupabaseClient } from "@supabase/supabase-js"
import type { BackendRecipe, RecipeGeneratorPayload } from "@/features/recipe-generator/types"
import { ingredientToken, ingredientTokens } from "@/lib/server/ingredient-token"
import { cuisinePriorityScore } from "@/lib/server/recipe-catalog-constants"

export type RecipeCatalogMeta = {
  catalogCount: number
  aiCount: number
  /** catalog | mixed | ai */
  source: "catalog" | "mixed" | "ai"
  /** 0–100 when total > 0 */
  catalogHitPercent: number
}

export type CatalogFindOptions = {
  perMealType: number
  excludeTitles?: string[]
  excludeSlugs?: string[]
}

type CatalogRow = {
  id: string
  slug: string
  title: string
  cuisine: string
  meal_type: string
  prep_time_bucket: string | null
  cooking_style: string | null
  is_vegetarian: boolean
  recipe_json: unknown
  image_url: string
  image_alt: string
  photographer: string
  photographer_url: string
}

type IngredientRow = {
  recipe_id: string
  ingredient_token: string
  is_required: boolean
}

function rowToBackendRecipe(row: CatalogRow): BackendRecipe {
  const j = row.recipe_json as BackendRecipe
  return {
    ...j,
    id: j.id || `catalog-${row.slug}`,
    title: j.title || row.title,
    image: row.image_url || j.image || "/images/default-food.jpg",
    mealType: j.mealType || row.meal_type,
  }
}

function matchesFilters(
  row: CatalogRow,
  request: RecipeGeneratorPayload,
  userCuisine: string | null
): boolean {
  if (userCuisine) {
    if (row.cuisine.trim().toLowerCase() !== userCuisine.trim().toLowerCase()) return false
  }
  if (request.mealPrepTime?.trim()) {
    const bucket = row.prep_time_bucket?.trim().toLowerCase() || ""
    const want = request.mealPrepTime.trim().toLowerCase()
    if (bucket && bucket !== want) return false
  }
  if (request.cookingStyle?.trim()) {
    const style = row.cooking_style?.trim().toLowerCase() || ""
    const want = request.cookingStyle.trim().toLowerCase()
    if (style && style !== want) return false
  }
  return true
}

function scoreRecipe(
  requiredTokens: string[],
  allTokens: string[],
  userSet: Set<string>
): number | null {
  if (requiredTokens.length === 0) return null
  for (const t of requiredTokens) {
    if (!userSet.has(t)) return null
  }
  let matched = 0
  for (const t of allTokens) {
    if (userSet.has(t)) matched++
  }
  const denom = Math.max(allTokens.length, 1)
  return matched / denom + requiredTokens.length * 0.05
}

export function buildCatalogMeta(catalogCount: number, aiCount: number): RecipeCatalogMeta {
  const total = catalogCount + aiCount
  const catalogHitPercent = total === 0 ? 0 : Math.round((catalogCount / total) * 100)
  const source: RecipeCatalogMeta["source"] =
    aiCount === 0 ? "catalog" : catalogCount === 0 ? "ai" : "mixed"
  return { catalogCount, aiCount, source, catalogHitPercent }
}

export function logCatalogMetrics(context: string, meta: RecipeCatalogMeta): void {
  console.info(
    `[recipe-catalog] ${context} source=${meta.source} catalog=${meta.catalogCount} ai=${meta.aiCount} hit=${meta.catalogHitPercent}%`
  )
}

/**
 * Find catalog recipes whose required ingredients are a subset of the user's pantry.
 */
export async function findRecipesByIngredients(
  supabase: SupabaseClient,
  request: RecipeGeneratorPayload,
  options: CatalogFindOptions
): Promise<BackendRecipe[]> {
  const userSet = ingredientTokens(request.ingredients)
  if (userSet.size === 0 || request.mealTypes.length === 0) return []

  const excludeTitles = new Set(
    (options.excludeTitles || []).map((t) => t.trim().toLowerCase()).filter(Boolean)
  )
  const excludeSlugs = new Set((options.excludeSlugs || []).map((s) => s.trim().toLowerCase()))

  const mealTypesLower = request.mealTypes.map((m) => m.trim().toLowerCase())
  const userCuisine = request.cuisine?.trim() || null

  const { data: recipeRows, error } = await supabase.from("catalog_recipes").select("*")
  if (error || !recipeRows?.length) return []

  const candidates = (recipeRows as CatalogRow[]).filter((row) => {
    if (excludeSlugs.has(row.slug.trim().toLowerCase())) return false
    if (excludeTitles.has(row.title.trim().toLowerCase())) return false
    if (!mealTypesLower.includes(row.meal_type.trim().toLowerCase())) return false
    return matchesFilters(row, request, userCuisine)
  })

  if (candidates.length === 0) return []

  const ids = candidates.map((c) => c.id)
  const { data: ingRows, error: ingErr } = await supabase
    .from("catalog_recipe_ingredients")
    .select("recipe_id, ingredient_token, is_required")
    .in("recipe_id", ids)

  if (ingErr || !ingRows?.length) return []

  const byRecipe = new Map<string, { required: string[]; all: string[] }>()
  for (const row of ingRows as IngredientRow[]) {
    let entry = byRecipe.get(row.recipe_id)
    if (!entry) {
      entry = { required: [], all: [] }
      byRecipe.set(row.recipe_id, entry)
    }
    entry.all.push(row.ingredient_token)
    if (row.is_required) entry.required.push(row.ingredient_token)
  }

  type Scored = { row: CatalogRow; score: number }
  const scored: Scored[] = []
  for (const row of candidates) {
    const ing = byRecipe.get(row.id)
    if (!ing) continue
    const s = scoreRecipe(ing.required, ing.all, userSet)
    if (s == null) continue
    scored.push({
      row,
      score: s + (1 / (1 + cuisinePriorityScore(row.cuisine))),
    })
  }

  scored.sort((a, b) => b.score - a.score || a.row.title.localeCompare(b.row.title))

  const perMeal = options.perMealType
  const picked: BackendRecipe[] = []
  for (const mealType of request.mealTypes) {
    const mt = mealType.trim().toLowerCase()
    const forMeal = scored.filter((s) => s.row.meal_type.trim().toLowerCase() === mt)
    let n = 0
    for (const s of forMeal) {
      if (n >= perMeal) break
      picked.push(rowToBackendRecipe(s.row))
      n++
    }
  }

  return picked
}

export function countNeededPerMealType(
  mealTypes: string[],
  perMealType: number,
  catalogRecipes: BackendRecipe[]
): { mealType: string; needed: number }[] {
  const gaps: { mealType: string; needed: number }[] = []
  for (const mealType of mealTypes) {
    const mt = mealType.trim().toLowerCase()
    const have = catalogRecipes.filter((r) => r.mealType.trim().toLowerCase() === mt).length
    const need = Math.max(0, perMealType - have)
    if (need > 0) gaps.push({ mealType, needed: need })
  }
  return gaps
}
