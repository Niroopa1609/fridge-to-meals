import { categorizeIngredient, type FridgeCategory } from "@/features/fridge/categorize-ingredient"

/** Lowercase typo / alternate spellings → canonical display name. */
const INGREDIENT_CORRECTIONS: Record<string, string> = {
  tomto: "Tomato",
  tomoto: "Tomato",
  tomateo: "Tomato",
  spinch: "Spinach",
  spinnach: "Spinach",
  spinache: "Spinach",
  yougurt: "Yogurt",
  yogert: "Yogurt",
  yoghourt: "Yogurt",
  yogourt: "Yogurt",
  onoin: "Onion",
  onoinn: "Onion",
  potatos: "Potato",
  potatoe: "Potato",
  brocoli: "Broccoli",
  brocolli: "Broccoli",
  broccolli: "Broccoli",
  cucmber: "Cucumber",
  cucumbr: "Cucumber",
  capcicum: "Capsicum",
  capsicuum: "Capsicum",
  mozarella: "Mozzarella",
  mozzerella: "Mozzarella",
  parmesean: "Parmesan",
  parmasan: "Parmesan",
  parmagian: "Parmesan",
  avacado: "Avocado",
  avacodo: "Avocado",
  bananna: "Banana",
  strwberry: "Strawberry",
  strawberrie: "Strawberry",
  zuchini: "Zucchini",
  zuccini: "Zucchini",
  cinamon: "Cinnamon",
  cinammon: "Cinnamon",
  oregeno: "Oregano",
  oreganno: "Oregano",
}

function titleCaseWords(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function splitCommaIngredients(raw: string): string[] {
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
}

export type ManualResolvedItem = {
  name: string
  category: FridgeCategory
  correction?: { from: string; to: string }
}

/**
 * Parses comma-separated input, applies known typo corrections, dedupes within the batch,
 * and skips names that already exist in `existingLower`.
 */
export function resolveManualIngredients(
  raw: string,
  existingLower: Set<string>
): { toAdd: ManualResolvedItem[]; skippedExisting: number; skippedInBatch: number } {
  const tokens = splitCommaIngredients(raw)
  const seenInBatch = new Set<string>()
  const toAdd: ManualResolvedItem[] = []
  let skippedExisting = 0
  let skippedInBatch = 0

  for (const token of tokens) {
    const trimmed = token.trim()
    if (!trimmed) continue

    const lower = trimmed.toLowerCase()
    const mapped = INGREDIENT_CORRECTIONS[lower]
    let canonical: string
    let correction: { from: string; to: string } | undefined

    if (mapped) {
      canonical = mapped
      if (lower !== mapped.toLowerCase()) {
        correction = { from: trimmed, to: mapped }
      }
    } else {
      canonical = titleCaseWords(trimmed)
    }

    if (!canonical) continue
    const key = canonical.toLowerCase()

    if (existingLower.has(key)) {
      skippedExisting++
      continue
    }
    if (seenInBatch.has(key)) {
      skippedInBatch++
      continue
    }
    seenInBatch.add(key)

    toAdd.push({
      name: canonical,
      category: categorizeIngredient(canonical),
      correction,
    })
  }

  return { toAdd, skippedExisting, skippedInBatch }
}
