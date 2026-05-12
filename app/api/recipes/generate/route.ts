import { NextResponse } from "next/server"
import { generateJsonText } from "@/lib/server/openaiClient"
import { buildRecipeGeneratePrompt } from "@/lib/server/recipePromptBuilder"
import { parseRecipeResponseJson } from "@/lib/server/recipeParser"
import { findRecipeImageUrl } from "@/lib/server/pexelsClient"
import type { BackendRecipe, RecipeGeneratorPayload } from "@/features/recipe-generator/types"

export const runtime = "nodejs"

async function enrichSingle(recipe: BackendRecipe, request: RecipeGeneratorPayload): Promise<BackendRecipe> {
  const imageUrl = await findRecipeImageUrl(recipe.title, request.cuisine || "any", recipe.mealType)
  return { ...recipe, image: imageUrl }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RecipeGeneratorPayload
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
    const jsonText = await generateJsonText(prompt)
    const parsed = parseRecipeResponseJson(jsonText)
    const expected = mealTypes.length * 2
    if (expected > 0 && parsed.recipes.length !== expected) {
      return NextResponse.json({ error: "Unexpected recipe count from model" }, { status: 502 })
    }
    const recipes: BackendRecipe[] = []
    for (const r of parsed.recipes) {
      recipes.push(await enrichSingle(r, request))
    }
    return NextResponse.json({ recipes })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
