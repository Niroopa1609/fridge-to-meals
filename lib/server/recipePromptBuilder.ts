import type { RecipeGeneratorPayload } from "@/features/recipe-generator/types"

export function buildRecipeGeneratePrompt(request: RecipeGeneratorPayload): string {
  return `You are generating recipes for a meal planner app.

Generate exactly 2 recipes PER meal type provided by the user.
If the user provides N meal types, return exactly N*2 recipes total.
Each recipe's mealType MUST be one of the provided meal types.

User input:
Ingredients: ${JSON.stringify(request.ingredients)}
Cuisine: ${request.cuisine}
Meal prep time: ${request.mealPrepTime}
Meal types: ${JSON.stringify(request.mealTypes)}
Cooking style: ${request.cookingStyle}

Return ONLY valid JSON. No markdown.

JSON format:
{
  "recipes": [
    {
      "id": "recipe-1",
      "title": "Recipe name",
      "image": "https://images.unsplash.com/...w=800&h=600&fit=crop",
      "mealType": "Breakfast",
      "difficulty": "EASY",
      "time": "30 minutes",
      "servings": 2,
      "isVegetarian": false,
      "description": "1-2 sentences.",
      "ingredients": ["item 1", "item 2"],
      "instructions": ["step 1", "step 2"],
      "proTips": ["tip 1"],
      "nutrition": {
        "calories": 250,
        "protein": "15g",
        "carbs": "30g",
        "fat": "8g"
      }
    }
  ]
}
`
}
