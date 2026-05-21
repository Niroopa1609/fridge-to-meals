"use client"

export type MealTypeOption = {
  id: string
  name: string
  apiValue: string
  /** Colorful illustrative icon */
  emoji: string
}

/** Recipe ideas generated per selected meal type (e.g. 1 type → 2 recipes). */
export const RECIPES_PER_MEAL_TYPE = 2

export const MEAL_TYPES: MealTypeOption[] = [
  { id: "soup", name: "Soup", apiValue: "Soup", emoji: "🍲" },
  { id: "salad", name: "Salad", apiValue: "Salad", emoji: "🥗" },
  { id: "snack", name: "Snack", apiValue: "Snack", emoji: "🥟" },
  { id: "finger-food", name: "Finger Food", apiValue: "Finger Food", emoji: "🍟" },
  { id: "kids-lunch", name: "Kids Lunch Box", apiValue: "Kids Lunch Box", emoji: "🥪" },
  { id: "starter", name: "Appetizer", apiValue: "Appetizer", emoji: "🍢" },
  { id: "breakfast", name: "Breakfast", apiValue: "Breakfast", emoji: "☀️" },
  { id: "lunch", name: "Lunch", apiValue: "Lunch", emoji: "🍱" },
  { id: "dinner", name: "Dinner", apiValue: "Dinner", emoji: "🍽️" },
  { id: "dessert", name: "Dessert", apiValue: "Dessert", emoji: "🍰" },
]

export const getMealTypeApiValues = (mealTypeIds: string[]) => {
  const byId = new Map(MEAL_TYPES.map((t) => [t.id, t] as const))
  return mealTypeIds.map((id) => byId.get(id)?.apiValue).filter((v): v is string => Boolean(v))
}
