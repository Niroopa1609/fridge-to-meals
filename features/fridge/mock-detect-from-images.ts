import { categorizeIngredient, type FridgeCategory } from "@/features/fridge/categorize-ingredient"

/** Template names inspired by common groceries; categories refined by keyword rules. */
const DETECTION_CANDIDATES: { name: string; category: FridgeCategory }[] = [
  { name: "Tomato", category: "Vegetables" },
  { name: "Cucumber", category: "Vegetables" },
  { name: "Onion", category: "Vegetables" },
  { name: "Capsicum", category: "Vegetables" },
  { name: "Potato", category: "Vegetables" },
  { name: "Carrot", category: "Vegetables" },
  { name: "Eggs", category: "Proteins" },
  { name: "Milk", category: "Dairy" },
  { name: "Spinach", category: "Vegetables" },
  { name: "Cheese", category: "Dairy" },
  { name: "Lemon", category: "Fruits" },
  { name: "Garlic", category: "Vegetables" },
  { name: "Ginger", category: "Vegetables" },
  { name: "Green Chili", category: "Vegetables" },
  { name: "Broccoli", category: "Vegetables" },
  { name: "Corn", category: "Vegetables" },
  { name: "Yogurt", category: "Dairy" },
  { name: "Rice", category: "Pantry" },
  { name: "Apple", category: "Fruits" },
  { name: "Banana", category: "Fruits" },
]

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
}

export function mockDetectNewIngredients(
  existingNamesLower: Set<string>,
  imageCountDelta: number
): { name: string; category: FridgeCategory }[] {
  const perImage = 4
  const want = Math.max(1, imageCountDelta) * perImage
  const pool = [...DETECTION_CANDIDATES]
  shuffleInPlace(pool)
  const out: { name: string; category: FridgeCategory }[] = []
  for (const row of pool) {
    const key = row.name.trim().toLowerCase()
    if (existingNamesLower.has(key)) continue
    existingNamesLower.add(key)
    const inferred = categorizeIngredient(row.name)
    const category: FridgeCategory = inferred !== "Others" ? inferred : row.category
    out.push({ name: row.name, category })
    if (out.length >= want) break
  }
  return out
}
