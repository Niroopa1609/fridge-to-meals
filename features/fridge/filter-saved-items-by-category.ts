import type { FridgeCategory } from "@/features/fridge/categorize-ingredient"
import type { FridgeItemDto } from "@/features/fridge/services/fridge"

const ALLOWED: FridgeCategory[] = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Proteins",
  "Pantry",
  "Others",
]

export type FridgeSummarySelection = "ALL" | FridgeCategory

export function normalizeSavedItemCategory(raw: string): FridgeCategory {
  const c = (raw ?? "").trim()
  if (ALLOWED.includes(c as FridgeCategory)) return c as FridgeCategory
  return "Others"
}

export function filterSavedItemsByCategory(
  items: FridgeItemDto[],
  selected: FridgeSummarySelection
): FridgeItemDto[] {
  if (selected === "ALL") return [...items]
  return items.filter((i) => normalizeSavedItemCategory(i.category) === selected)
}

export function getFridgeSummaryListTitle(selected: FridgeSummarySelection): string {
  if (selected === "ALL") return "All Ingredients"
  return selected
}

export function getFridgeSummaryEmptyMessage(selected: FridgeSummarySelection): string {
  if (selected === "ALL") return "No ingredients in your fridge yet."
  return `No ${selected.toLowerCase()} in your fridge.`
}
