import { NextResponse } from "next/server"
import { throwIfAborted } from "@/lib/abort"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateJsonText } from "@/lib/server/openaiClient"
import { buildPartialRecipeGeneratePrompt, buildRecipeGeneratePrompt } from "@/lib/server/recipePromptBuilder"
import { parseRecipeResponseJson } from "@/lib/server/recipeParser"
import { findRecipeImageUrl } from "@/lib/server/pexelsClient"
import {
  buildCatalogMeta,
  countNeededPerMealType,
  findRecipesByIngredients,
  logCatalogMetrics,
} from "@/lib/server/recipe-catalog"
import { abortAwareCatch, abortedResponse } from "@/lib/server/route-abort"
import type { BackendRecipe, RecipeGeneratorPayload } from "@/features/recipe-generator/types"

export const runtime = "nodejs"

const PER_MEAL_TYPE = 2

async function enrichSingle(
  recipe: BackendRecipe,
  request: RecipeGeneratorPayload,
  signal?: AbortSignal
): Promise<BackendRecipe> {
  throwIfAborted(signal)
  if (recipe.image?.trim() && recipe.image !== "/images/default-food.jpg") {
    return recipe
  }
  const imageUrl = await findRecipeImageUrl(recipe.title, request.cuisine || "any", recipe.mealType, signal)
  return { ...recipe, image: imageUrl }
}

async function generateAiRecipes(
  request: RecipeGeneratorPayload,
  gaps: { mealType: string; needed: number }[],
  signal?: AbortSignal
): Promise<BackendRecipe[]> {
  const totalNeeded = gaps.reduce((s, g) => s + g.needed, 0)
  if (totalNeeded === 0) return []

  const prompt =
    gaps.length > 0 && totalNeeded < request.mealTypes.length * PER_MEAL_TYPE
      ? buildPartialRecipeGeneratePrompt(request, gaps)
      : buildRecipeGeneratePrompt({
          ...request,
          mealTypes: gaps.length > 0 ? gaps.map((g) => g.mealType) : request.mealTypes,
        })

  const jsonText = await generateJsonText(prompt, signal)
  throwIfAborted(signal)
  const parsed = parseRecipeResponseJson(jsonText)
  return parsed.recipes
}

export async function POST(req: Request) {
  const signal = req.signal
  try {
    const body = (await req.json()) as RecipeGeneratorPayload
    throwIfAborted(signal)
    const ingredients = Array.isArray(body.ingredients) ? body.ingredients : []
    const mealTypes = Array.isArray(body.mealTypes) ? body.mealTypes : []
    if (!ingredients.length || !mealTypes.length) {
      return NextResponse.json({ error: "ingredients and mealTypes required" }, { status: 400 })
    }
    const request: RecipeGeneratorPayload = {
      ingredients,
      cuisine: body.cuisine ?? null,
      mealPrepTime: body.mealPrepTime ?? null,
      cookingStyle: body.cookingStyle ?? null,
      mealTypes,
    }

    const supabase = createAdminClient()
    const catalogRecipes = await findRecipesByIngredients(supabase, request, {
      perMealType: PER_MEAL_TYPE,
    })

    const gaps = countNeededPerMealType(mealTypes, PER_MEAL_TYPE, catalogRecipes)
    let aiRecipes: BackendRecipe[] = []

    if (gaps.length > 0) {
      aiRecipes = await generateAiRecipes(request, gaps, signal)
      const enriched: BackendRecipe[] = []
      for (const r of aiRecipes) {
        throwIfAborted(signal)
        enriched.push(await enrichSingle(r, request, signal))
      }
      aiRecipes = enriched
    }

    const recipes = [...catalogRecipes, ...aiRecipes]
    const expected = mealTypes.length * PER_MEAL_TYPE
    if (expected > 0 && recipes.length < expected) {
      return NextResponse.json({ error: "Could not generate enough recipes" }, { status: 502 })
    }

    const meta = buildCatalogMeta(catalogRecipes.length, aiRecipes.length)
    logCatalogMetrics("generate", meta)

    if (signal.aborted) return abortedResponse()
    return NextResponse.json({ recipes: recipes.slice(0, expected || recipes.length), meta })
  } catch (e) {
    const aborted = abortAwareCatch(e)
    if (aborted) return aborted
    if (signal.aborted) return abortedResponse()
    const msg = e instanceof Error ? e.message : "Generation failed"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
