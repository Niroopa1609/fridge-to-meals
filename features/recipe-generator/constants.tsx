"use client"

export type MealTypeOption = {
  id: string
  name: string
  apiValue: string
  /** Colorful illustrative icon (matches product mocks) */
  emoji: string
}

export const MEAL_TYPES: MealTypeOption[] = [
  { id: "soup", name: "Soup", apiValue: "Soup", emoji: "🍲" },
  { id: "salad", name: "Salad", apiValue: "Salad", emoji: "🥗" },
  { id: "starter", name: "Appetizer", apiValue: "Appetizer", emoji: "🍤" },
  { id: "breakfast", name: "Breakfast", apiValue: "Breakfast", emoji: "🌅" },
  { id: "lunch", name: "Lunch", apiValue: "Lunch", emoji: "🥪" },
  { id: "snack", name: "Snack", apiValue: "Snack", emoji: "🍎" },
  { id: "dinner", name: "Dinner", apiValue: "Dinner", emoji: "🍽️" },
]

export const getMealTypeApiValues = (mealTypeIds: string[]) => {
  const byId = new Map(MEAL_TYPES.map((t) => [t.id, t] as const))
  return mealTypeIds.map((id) => byId.get(id)?.apiValue).filter((v): v is string => Boolean(v))
}
