import type { Recipe } from "@/components/recipe-card"

export type RecipeGeneratorFormState = {
  ingredients: string[]
  cuisine: string
  mealPrepTime: string
  cookingStyle: string
  mealTypeIds: string[]
}

export type RecipeGeneratorPayload = {
  ingredients: string[]
  cuisine: string | null
  mealPrepTime: string | null
  cookingStyle: string | null
  mealTypes: string[]
}

export type BackendRecipe = {
  id: string
  title: string
  image: string
  mealType: string
  difficulty: "EASY" | "MEDIUM" | "HARD" | string
  time: string
  servings: number
  isVegetarian: boolean
  description: string
  ingredients: string[]
  instructions: string[]
  proTips: string[]
  nutrition: {
    calories: number
    protein: string
    carbs: string
    fat: string
  }
}

export type GenerateRecipesResponse = {
  recipes: BackendRecipe[]
}

export type UiRecipe = Recipe

