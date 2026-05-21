import { NextResponse } from "next/server"
import { throwIfAborted } from "@/lib/abort"
import { generateJsonText } from "@/lib/server/openaiClient"
import { buildRecipeGeneratePrompt } from "@/lib/server/recipePromptBuilder"
import { parseRecipeResponseJson } from "@/lib/server/recipeParser"
import { findRecipeImageUrl } from "@/lib/server/pexelsClient"
import { abortAwareCatch, abortedResponse } from "@/lib/server/route-abort"
import type { BackendRecipe, RecipeGeneratorPayload } from "@/features/recipe-generator/types"

export const runtime = "nodejs"

function hasUsableImage(image: string | undefined): boolean {
  const url = image?.trim() || ""
  return Boolean(url && url !== "/images/default-food.jpg")
}

async function enrichSingle(
  recipe: BackendRecipe,
  request: RecipeGeneratorPayload,
  signal?: AbortSignal
): Promise<BackendRecipe> {
  throwIfAborted(signal)
  if (hasUsableImage(recipe.image)) return recipe
  const imageUrl = await findRecipeImageUrl(recipe.title, request.cuisine || "any", recipe.mealType, signal)
  return { ...recipe, image: imageUrl }
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
    const prompt = buildRecipeGeneratePrompt(request)
    const jsonText = await generateJsonText(prompt, signal)
    throwIfAborted(signal)
    const parsed = parseRecipeResponseJson(jsonText)
    const recipesPerMealType = 2
    const expected = mealTypes.length * recipesPerMealType
    if (expected > 0 && parsed.recipes.length !== expected) {
      return NextResponse.json(
        {
          error: `Expected ${expected} recipe(s) (${recipesPerMealType} per meal type), got ${parsed.recipes.length}`,
        },
        { status: 502 }
      )
    }
    throwIfAborted(signal)
    const recipes = await Promise.all(parsed.recipes.map((r) => enrichSingle(r, request, signal)))
    if (signal.aborted) return abortedResponse()
    return NextResponse.json({ recipes })
  } catch (e) {
    const aborted = abortAwareCatch(e)
    if (aborted) return aborted
    if (signal.aborted) return abortedResponse()
    const msg = e instanceof Error ? e.message : "Generation failed"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
