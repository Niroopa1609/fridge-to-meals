import type { RecipeGeneratorPayload } from "@/features/recipe-generator/types"

const RECIPES_PER_MEAL_TYPE = 2

export function buildRecipeGeneratePrompt(request: RecipeGeneratorPayload): string {
  const mealCount = request.mealTypes.length
  const totalRecipes = mealCount * RECIPES_PER_MEAL_TYPE
  const perTypeHint =
    mealCount === 1
      ? `Generate exactly ${totalRecipes} recipes for the selected meal type.`
      : `Generate exactly ${totalRecipes} recipes (${RECIPES_PER_MEAL_TYPE} per meal type).`
  return `${perTypeHint} Return ONLY valid JSON.

Meal types (each recipe mealType must be one of these): ${JSON.stringify(request.mealTypes)}
Ingredients: ${JSON.stringify(request.ingredients)}
Cuisine: ${request.cuisine ?? "any"}
Prep time: ${request.mealPrepTime ?? "any"}
Cooking style: ${request.cookingStyle ?? "any"}

Rules:
- Use listed ingredients; pantry staples (salt, oil, spices, water) are OK.
- Do not repeat the same title across recipes.
- Description: 1-2 sentences. Instructions: 5-7 clear steps. Pro tips: 1-2.
- Ingredients: 6-12 lines. EVERY line MUST include quantity + unit + name (scale to servings). Format examples: "200g paneer, cubed", "2 tbsp vegetable oil", "1 medium onion, diced", "1/2 tsp salt".
- Do not list bare ingredient names without amounts.
- Omit "image" or use "image": "". Images are added server-side. Do not invent URLs.

JSON shape:
{"recipes":[{"id":"recipe-1","title":"...","mealType":"Breakfast","difficulty":"EASY","time":"30 minutes","servings":2,"isVegetarian":false,"description":"...","ingredients":["200g paneer, cubed","1 tbsp oil"],"instructions":["..."],"proTips":["..."],"nutrition":{"calories":250,"protein":"15g","carbs":"30g","fat":"8g"}}]}
`
}
