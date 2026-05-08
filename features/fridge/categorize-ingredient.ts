export type FridgeCategory = "Vegetables" | "Fruits" | "Dairy" | "Proteins" | "Pantry" | "Others"

const VEG = /\b(tomato|cucumber|onion|capsicum|pepper|potato|carrot|spinach|broccoli|corn|garlic|ginger|chili|lettuce|kale|celery|cabbage|cauliflower|zucchini|eggplant|beans|peas|asparagus|radish|beet|mushroom)\b/i
const FRUIT = /\b(lemon|lime|apple|banana|orange|berry|grape|mango|melon|peach|pear|plum|kiwi|avocado|fruit)\b/i
const DAIRY = /\b(milk|cheese|yogurt|cream|butter|paneer|curd|dairy)\b/i
const PROTEIN = /\b(egg|chicken|beef|pork|fish|salmon|tuna|shrimp|prawn|tofu|turkey|lamb|meat|protein|ham|bacon)\b/i
const PANTRY = /\b(rice|pasta|flour|sugar|oil|vinegar|sauce|spice|herb|noodle|cereal|honey|jam|bread|cracker|oat|lentil|chickpea|bean can)\b/i

export function categorizeIngredient(name: string): FridgeCategory {
  const n = name.trim()
  if (!n) return "Others"
  if (VEG.test(n)) return "Vegetables"
  if (FRUIT.test(n)) return "Fruits"
  if (DAIRY.test(n)) return "Dairy"
  if (PROTEIN.test(n)) return "Proteins"
  if (PANTRY.test(n)) return "Pantry"
  return "Others"
}
