/** Shared copy for low vegetable / protein stock in My Fridge. */

import { categorizeIngredient, type FridgeCategory } from "@/features/fridge/categorize-ingredient"

const DAIRY_PROTEIN_PATTERN = /paneer|tofu|cheese|yogurt|yoghurt|curd|egg/i

type NamedItem = { category: string; name: string }

function effectiveCategory(item: NamedItem): FridgeCategory {
  const stored = item.category?.trim()
  if (
    stored === "Vegetables" ||
    stored === "Fruits" ||
    stored === "Dairy" ||
    stored === "Proteins"
  ) {
    return stored
  }
  return categorizeIngredient(item.name)
}

export function fridgeStockTips(items: NamedItem[]): string[] {
  const tips: string[] = []
  let vegetableCount = 0
  let proteinCategoryCount = 0
  let dairyProteinCount = 0
  for (const item of items) {
    const cat = effectiveCategory(item)
    if (cat === "Vegetables") vegetableCount++
    if (cat === "Proteins") proteinCategoryCount++
    if (cat === "Dairy" && DAIRY_PROTEIN_PATTERN.test(item.name)) dairyProteinCount++
  }
  const proteinTotal = proteinCategoryCount + dairyProteinCount

  if (vegetableCount < 6) {
    tips.push(
      "Your fridge is light on vegetables. Add a few more in My Fridge—like spinach, tomatoes, onions, or peppers—for more varied daily meal ideas."
    )
  }
  if (proteinTotal < 3) {
    tips.push(
      "Your fridge is light on protein. Add items such as eggs, chicken, lentils, beans, paneer, or tofu in My Fridge so we can suggest balanced meals across the day."
    )
  }
  return tips
}

export function fridgeStockTipsFromGrouped(grouped: Record<string, string[]>): string[] {
  const items: NamedItem[] = []
  for (const [category, names] of Object.entries(grouped)) {
    for (const name of names) {
      if (name?.trim()) items.push({ category, name: name.trim() })
    }
  }
  return fridgeStockTips(items)
}
