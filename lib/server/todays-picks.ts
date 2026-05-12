/*
 * AUTH / DB NOTE (Supabase migration):
 * Option B was chosen over Supabase Auth: keep public.users + password_hash + refresh_tokens
 * so existing deployments can move the DB without re-hashing passwords into auth.users.
 * All reads/writes use the service role from Next.js Route Handlers only after JWT validation.
 * RLS is enabled on tables for defense-in-depth against anon/authenticated PostgREST access.
 */
import { createHash } from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import { generateJsonText } from "@/lib/server/openaiClient"
import { findRecipeImageMeta } from "@/lib/server/pexelsClient"
import { parseRecipeResponseJson } from "@/lib/server/recipeParser"
import type { BackendRecipe } from "@/features/recipe-generator/types"

const MEALS = ["Breakfast", "Lunch", "Dinner"] as const
const CATEGORY_ORDER = ["Vegetables", "Fruits", "Dairy", "Proteins", "Pantry", "Others"] as const
const ALLOWED_CATEGORIES = new Set<string>(CATEGORY_ORDER)

export type Nutrition = { calories: number; protein: string; carbs: string; fat: string }

export type TodayPickRecipeOut = {
  id: string
  title: string
  mealType: string
  difficulty: string
  time: string
  servings: number
  isVegetarian: boolean
  description: string
  ingredients: string[]
  instructions: string[]
  proTips: string[]
  nutrition: Nutrition
  imageUrl: string
  imageAlt: string
  photographer: string
  photographerUrl: string
}

export type TodayPicksResponseOut = {
  recipes: TodayPickRecipeOut[]
  warnings: string[]
}

type Grouped = Record<string, string[]>

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededRand(seedStr: string) {
  let h = 0
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i)
  }
  return mulberry32(h | 0)
}

function shuffleInPlace<T>(arr: T[], rnd: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

function dedupePreserveOrder(values: string[]): string[] {
  const map = new Map<string, string>()
  for (const v of values) {
    if (v == null) continue
    const t = v.trim()
    if (!t) continue
    const k = t.toLowerCase()
    if (!map.has(k)) map.set(k, t)
  }
  return [...map.values()]
}

function groupFridge(namesCategories: { name: string; category: string | null }[]): Grouped {
  const grouped: Grouped = {}
  for (const c of CATEGORY_ORDER) {
    grouped[c] = []
  }
  for (const it of namesCategories) {
    let cat = it.category?.trim() || ""
    if (!ALLOWED_CATEGORIES.has(cat)) cat = "Others"
    const name = (it.name || "").trim()
    if (!name) continue
    grouped[cat]!.push(name)
  }
  for (const k of Object.keys(grouped)) {
    grouped[k] = dedupePreserveOrder(grouped[k]!)
  }
  return grouped
}

function fridgeHash(grouped: Grouped): string {
  try {
    const md = createHash("sha256")
    for (const k of CATEGORY_ORDER) {
      md.update(k, "utf8")
      md.update(":")
      for (const v of grouped[k] || []) {
        md.update(v.toLowerCase(), "utf8")
        md.update(",")
      }
      md.update(";")
    }
    return md.digest("hex")
  } catch {
    return crypto.randomUUID()
  }
}

function containsIgnoreCase(list: string[], value: string): boolean {
  const key = value.trim().toLowerCase()
  return list.some((s) => s.trim().toLowerCase() === key)
}

function pickBestExcluding(values: string[], recencyRank: Map<string, number>, exclude: string[]): string | null {
  let best: string | null = null
  let bestRank = Number.POSITIVE_INFINITY
  for (const v of values) {
    if (!v?.trim()) continue
    if (containsIgnoreCase(exclude, v)) continue
    const r = recencyRank.get(v.trim().toLowerCase()) ?? 999
    if (r < bestRank) {
      bestRank = r
      best = v.trim()
    }
  }
  if (best) return best
  for (const v of values) {
    if (!v?.trim()) continue
    if (containsIgnoreCase(exclude, v)) continue
    return v.trim()
  }
  return values.length ? values[0]!.trim() : null
}

function findProteinByKeyword(
  proteins: string[],
  usedProteins: Set<string>,
  recencyRank: Map<string, number>,
  keyword: string
): string | null {
  let best: string | null = null
  let bestRank = Number.POSITIVE_INFINITY
  for (const p of proteins) {
    if (!p?.trim()) continue
    const t = p.trim()
    const key = t.toLowerCase()
    if (usedProteins.has(key)) continue
    if (!key.includes(keyword)) continue
    const r = recencyRank.get(key) ?? 999
    if (r < bestRank) {
      bestRank = r
      best = t
    }
  }
  return best
}

function pickProteinFor(
  meal: string,
  proteins: string[],
  usedProteins: Set<string>,
  recencyRank: Map<string, number>
): string | null {
  const prefs =
    meal === "Breakfast"
      ? ["egg", "paneer", "tofu", "yogurt", "milk", "cheese", "oats", "bread"]
      : meal === "Lunch"
        ? ["chicken", "paneer", "beans", "lentil", "rice", "tofu", "egg"]
        : meal === "Dinner"
          ? ["fish", "chicken", "tofu", "paneer", "eggplant", "brinjal", "zucchini", "squash"]
          : []
  for (const kw of prefs) {
    const match = findProteinByKeyword(proteins, usedProteins, recencyRank, kw)
    if (match) {
      usedProteins.add(match.toLowerCase())
      return match
    }
  }
  for (const p of proteins) {
    if (!p?.trim()) continue
    const key = p.trim().toLowerCase()
    if (usedProteins.has(key)) continue
    usedProteins.add(key)
    return p.trim()
  }
  return proteins.length ? proteins[0]!.trim() : null
}

function pickVegForMeal(
  veggies: string[],
  usedVeg: Set<string>,
  recencyRank: Map<string, number>,
  count: number,
  rnd: () => number
): string[] {
  const pool = [...veggies].sort(
    (a, b) =>
      (recencyRank.get(a.toLowerCase()) ?? 999) - (recencyRank.get(b.toLowerCase()) ?? 999) ||
      a.localeCompare(b, undefined, { sensitivity: "base" })
  )
  if (pool.length > 1) shuffleInPlace(pool, rnd)
  const picked: string[] = []
  for (const v of pool) {
    if (picked.length >= count) break
    if (!v?.trim()) continue
    const key = v.trim().toLowerCase()
    if (usedVeg.has(key)) continue
    usedVeg.add(key)
    picked.push(v.trim())
  }
  for (const v of pool) {
    if (picked.length >= count) break
    if (!v?.trim()) continue
    if (containsIgnoreCase(picked, v)) continue
    picked.push(v.trim())
  }
  return picked
}

function buildMealList(
  primaryProtein: string | null,
  veg: string[],
  dairy: string[],
  pantry: string[],
  others: string[],
  recencyRank: Map<string, number>,
  max: number
): string[] {
  const out: string[] = []
  if (primaryProtein?.trim()) out.push(primaryProtein.trim())
  out.push(...veg)
  if (out.length < max && dairy.length) {
    const x = pickBestExcluding(dairy, recencyRank, out)
    if (x) out.push(x)
  }
  if (out.length < max && pantry.length) {
    const x = pickBestExcluding(pantry, recencyRank, out)
    if (x) out.push(x)
  }
  if (out.length < max && others.length) {
    const x = pickBestExcluding(others, recencyRank, out)
    if (x) out.push(x)
  }
  return dedupePreserveOrder(out).slice(0, max)
}

function planDistinctIngredients(
  grouped: Grouped,
  recencyRank: Map<string, number>,
  variationToken: string,
  rnd: () => number
): Record<string, string[]> {
  const proteins = grouped.Proteins || []
  const veggies = grouped.Vegetables || []
  const dairy = grouped.Dairy || []
  const pantry = grouped.Pantry || []
  const others = grouped.Others || []
  const usedProteins = new Set<string>()
  const usedVeg = new Set<string>()
  const breakfastProtein = pickProteinFor("Breakfast", proteins, usedProteins, recencyRank)
  const lunchProtein = pickProteinFor("Lunch", proteins, usedProteins, recencyRank)
  const dinnerProtein = pickProteinFor("Dinner", proteins, usedProteins, recencyRank)
  const breakfastVeg = pickVegForMeal(veggies, usedVeg, recencyRank, 1, rnd)
  const lunchVeg = pickVegForMeal(veggies, usedVeg, recencyRank, 2, rnd)
  const dinnerVeg = pickVegForMeal(veggies, usedVeg, recencyRank, 2, rnd)
  return {
    Breakfast: buildMealList(breakfastProtein, breakfastVeg, dairy, pantry, others, recencyRank, 4),
    Lunch: buildMealList(lunchProtein, lunchVeg, dairy, pantry, others, recencyRank, 5),
    Dinner: buildMealList(dinnerProtein, dinnerVeg, dairy, pantry, others, recencyRank, 5),
  }
}

function warningsFor(grouped: Grouped): string[] {
  const warnings: string[] = []
  const veg = (grouped.Vegetables || []).length
  const protein = (grouped.Proteins || []).length
  if (veg < 2) warnings.push("Add more vegetables to improve meal suggestions.")
  if (protein < 1) warnings.push("Add more proteins to improve meal suggestions.")
  return warnings
}

function mergeWarnings(base: string[], extra: string[] | null | undefined): string[] {
  const out = new Set<string>(base)
  if (extra) for (const e of extra) out.add(e)
  return [...out]
}

function buildRecencyRank(last3: { used_ingredients_json: string }[]): Map<string, number> {
  const rank = new Map<string, number>()
  let dayIndex = 0
  for (const cache of last3) {
    dayIndex++
    try {
      const used = JSON.parse(cache.used_ingredients_json) as unknown
      if (!Array.isArray(used)) continue
      for (const u of used) {
        const key = String(u || "")
          .trim()
          .toLowerCase()
        if (!key) continue
        if (!rank.has(key)) rank.set(key, dayIndex)
      }
    } catch {
      /* ignore */
    }
  }
  return rank
}

function extractUsedIngredients(chosenByMeal: Record<string, string[]>): string[] {
  const used: string[] = []
  for (const m of MEALS) {
    used.push(...(chosenByMeal[m] || []))
  }
  return dedupePreserveOrder(used)
}

function cuisineForMeal(mealType: string, preferredCuisines: string[]): string {
  if (!preferredCuisines.length) return "any"
  const mt = (mealType || "").trim().toLowerCase()
  let idx = 0
  if (mt.includes("breakfast")) idx = 0
  else if (mt.includes("lunch")) idx = 1
  else if (mt.includes("dinner")) idx = 2
  return preferredCuisines[idx % preferredCuisines.length]!
}

function fallbackImageForMeal(mealType: string): string {
  const mt = (mealType || "").trim().toLowerCase()
  if (mt.includes("breakfast")) return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop"
  if (mt.includes("lunch")) return "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800&h=600&fit=crop"
  if (mt.includes("dinner")) return "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop"
  return "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop"
}

function buildTodayPicksPrompt(
  grouped: Grouped,
  chosenByMeal: Record<string, string[]>,
  preferredCuisines: string[],
  avoidTitles: string[],
  variationToken: string
): string {
  const safeList = (v: string[] | undefined) => (v == null ? "[]" : JSON.stringify(v))
  return `You are generating daily meal picks for a meal planner app.

Your task:
- Generate EXACTLY 3 recipes total: one Breakfast, one Lunch, one Dinner.
- Use ONLY the selected fridge ingredients provided for each meal as the main items.
- Pantry staples (salt, oil, spices, water) can be assumed and do not need to be listed as fridge ingredients.
- Keep recipes realistic, simple, and home-cooking friendly.
- If ingredients are insufficient, still produce recipes using what is available and add a warning message.
- IMPORTANT: Avoid repeating the same recipe titles. Do NOT reuse any titles from the avoid list below.
- IMPORTANT: The three recipes must NOT reuse the same primary protein when different proteins are available.
- IMPORTANT: The three recipes must NOT reuse the same main vegetable combination when different vegetables are available.
- IMPORTANT: Do NOT repeat the same main ingredient set across Breakfast, Lunch, and Dinner.
- Match ingredients naturally to the meal type (breakfast simpler, lunch/dinner heartier).
- Prefer cuisines from the user's preferred cuisine list. Do NOT use cuisines outside that list unless no match is possible.
- If multiple cuisines are selected, distribute cuisines across meals when it fits the ingredients.

Ingredient groups from My Fridge (for context):
Vegetables: ${safeList(grouped.Vegetables)}
Proteins: ${safeList(grouped.Proteins)}
Fruits: ${safeList(grouped.Fruits)}
Dairy: ${safeList(grouped.Dairy)}
Pantry: ${safeList(grouped.Pantry)}
Others: ${safeList(grouped.Others)}

Selected ingredients to use:
Breakfast: ${safeList(chosenByMeal.Breakfast)}
Lunch: ${safeList(chosenByMeal.Lunch)}
Dinner: ${safeList(chosenByMeal.Dinner)}

Constraints:
- Each recipe MUST primarily use the ingredients listed for that meal.
- Do not include the Lunch or Dinner ingredient group as the main ingredients for Breakfast, etc.

User preferred cuisines: ${safeList(preferredCuisines)}

Avoid titles (do not repeat): ${safeList(avoidTitles)}
Variation token: ${variationToken || ""}

Output rules:
- Return ONLY valid JSON. No markdown.
- Return this exact JSON shape:
{
  "recipes": [
    {
      "id": "today-breakfast",
      "title": "Recipe name",
      "imageUrl": "",
      "imageAlt": "",
      "photographer": "",
      "photographerUrl": "",
      "mealType": "Breakfast",
      "difficulty": "EASY",
      "time": "15 minutes",
      "servings": 2,
      "isVegetarian": false,
      "description": "1-2 sentences.",
      "ingredients": ["item 1", "item 2"],
      "instructions": ["step 1", "step 2"],
      "proTips": ["tip 1"],
      "nutrition": { "calories": 250, "protein": "15g", "carbs": "30g", "fat": "8g" }
    }
  ],
  "warnings": []
}
`
}

function normalizeResponse(response: TodayPicksResponseOut | null): TodayPicksResponseOut {
  if (!response?.recipes) return { recipes: [], warnings: [] }
  const recipes = response.recipes.filter(Boolean)
  const byMeal = new Map<string, TodayPickRecipeOut>()
  for (const r of recipes) {
    const mt = (r.mealType || "").trim()
    if (!mt) continue
    if (!byMeal.has(mt)) byMeal.set(mt, r)
  }
  const ordered: TodayPickRecipeOut[] = []
  for (const m of MEALS) {
    const hit = [...byMeal.entries()].find(([k]) => k.toLowerCase() === m.toLowerCase())?.[1]
    if (hit) ordered.push(hit)
  }
  if (ordered.length < 3) {
    for (const r of recipes) {
      if (ordered.length >= 3) break
      if (!ordered.includes(r)) ordered.push(r)
    }
  }
  return {
    recipes: ordered.slice(0, 3),
    warnings: Array.isArray(response.warnings) ? response.warnings : [],
  }
}

function looseNutrition(n: unknown): Nutrition {
  if (!n || typeof n !== "object") return { calories: 0, protein: "", carbs: "", fat: "" }
  const o = n as Record<string, unknown>
  return {
    calories: Number(o.calories ?? 0),
    protein: String(o.protein ?? ""),
    carbs: String(o.carbs ?? ""),
    fat: String(o.fat ?? ""),
  }
}

function mapLooseToTodayPick(obj: Record<string, unknown>): TodayPickRecipeOut {
  return {
    id: String(obj.id ?? ""),
    title: String(obj.title ?? ""),
    mealType: String(obj.mealType ?? ""),
    difficulty: String(obj.difficulty ?? "EASY"),
    time: String(obj.time ?? ""),
    servings: Number(obj.servings ?? 2),
    isVegetarian: Boolean(obj.isVegetarian),
    description: String(obj.description ?? ""),
    ingredients: Array.isArray(obj.ingredients) ? obj.ingredients.map(String) : [],
    instructions: Array.isArray(obj.instructions) ? obj.instructions.map(String) : [],
    proTips: Array.isArray(obj.proTips) ? obj.proTips.map(String) : [],
    nutrition: looseNutrition(obj.nutrition),
    imageUrl: String(obj.imageUrl ?? obj.image ?? ""),
    imageAlt: String(obj.imageAlt ?? ""),
    photographer: String(obj.photographer ?? ""),
    photographerUrl: String(obj.photographerUrl ?? ""),
  }
}

async function enrichSingle(
  r: TodayPickRecipeOut,
  preferredCuisines: string[]
): Promise<TodayPickRecipeOut> {
  const hasImg =
    r.imageUrl &&
    r.imageUrl.trim() &&
    r.imageUrl !== "/images/default-food.jpg"
  if (hasImg) return r
  const cuisine = cuisineForMeal(r.mealType, preferredCuisines)
  const mealType = r.mealType || ""
  const img = await findRecipeImageMeta(r.title, cuisine, mealType)
  let imageUrl = img.imageUrl
  if (!imageUrl?.trim() || imageUrl === "/images/default-food.jpg") {
    imageUrl = fallbackImageForMeal(mealType)
  }
  return {
    ...r,
    imageUrl,
    imageAlt: img.imageAlt,
    photographer: img.photographer,
    photographerUrl: img.photographerUrl,
  }
}

async function enrichRecipes(
  recipes: unknown[],
  preferredCuisines: string[]
): Promise<TodayPickRecipeOut[]> {
  const out: TodayPickRecipeOut[] = []
  for (const obj of recipes) {
    if (!obj || typeof obj !== "object") continue
    const r = mapLooseToTodayPick(obj as Record<string, unknown>)
    out.push(await enrichSingle(r, preferredCuisines))
  }
  return out
}

async function enrichFromRecipesList(recipes: BackendRecipe[], preferredCuisines: string[]): Promise<TodayPickRecipeOut[]> {
  const mapped: TodayPickRecipeOut[] = recipes.map((r) =>
    mapLooseToTodayPick({
      ...r,
      imageUrl: r.image,
      imageAlt: "",
      photographer: "",
      photographerUrl: "",
    })
  )
  const result: TodayPickRecipeOut[] = []
  for (const m of mapped) {
    result.push(await enrichSingle(m, preferredCuisines))
  }
  return result
}

export async function getTodayPicks(
  supabase: SupabaseClient,
  userId: string,
  refresh: boolean
): Promise<TodayPicksResponseOut> {
  const pickDate = new Date().toISOString().slice(0, 10)

  const { data: fridgeRows, error: fridgeErr } = await supabase
    .from("fridge_items")
    .select("name, category")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (fridgeErr) throw new Error(fridgeErr.message)

  if (!fridgeRows?.length) {
    return { recipes: [], warnings: ["Add ingredients to My Fridge to get daily meal ideas."] }
  }

  const grouped = groupFridge(fridgeRows as { name: string; category: string | null }[])
  const fHash = fridgeHash(grouped)

  const { data: cachedRow } = await supabase
    .from("today_picks_cache")
    .select("id, fridge_hash, response_json, used_ingredients_json")
    .eq("user_id", userId)
    .eq("pick_date", pickDate)
    .maybeSingle()

  if (!refresh && cachedRow?.response_json && cachedRow.fridge_hash === fHash) {
    try {
      const parsed = JSON.parse(cachedRow.response_json) as TodayPicksResponseOut
      return normalizeResponse(parsed)
    } catch {
      /* fall through */
    }
  }

  const { data: last3 } = await supabase
    .from("today_picks_cache")
    .select("used_ingredients_json, pick_date")
    .eq("user_id", userId)
    .order("pick_date", { ascending: false })
    .limit(3)

  const recencyRank = buildRecencyRank((last3 || []) as { used_ingredients_json: string }[])

  const avoidTitles: string[] = []
  if (cachedRow?.response_json) {
    try {
      const prev = JSON.parse(cachedRow.response_json) as TodayPicksResponseOut
      if (prev?.recipes) {
        for (const r of prev.recipes) {
          const t = r?.title?.trim()
          if (t) avoidTitles.push(t)
        }
      }
    } catch {
      /* ignore */
    }
  }

  const variationToken = refresh ? crypto.randomUUID() : ""
  const rnd = seededRand(variationToken || "default-seed")
  const chosenByMeal = planDistinctIngredients(grouped, recencyRank, variationToken, rnd)
  const warnings = warningsFor(grouped)

  const { data: prefRow } = await supabase.from("user_preferences").select("preferred_cuisines").eq("user_id", userId).maybeSingle()
  let preferredCuisines: string[] = []
  if (prefRow?.preferred_cuisines != null) {
    try {
      const raw = prefRow.preferred_cuisines as unknown
      preferredCuisines = Array.isArray(raw) ? raw.map((x) => String(x)) : []
    } catch {
      preferredCuisines = []
    }
  }

  const prompt = buildTodayPicksPrompt(grouped, chosenByMeal, preferredCuisines, avoidTitles, variationToken)
  const jsonText = await generateJsonText(prompt)

  let response: TodayPicksResponseOut
  try {
    response = JSON.parse(jsonText) as TodayPicksResponseOut
    response = {
      recipes: await enrichRecipes(response.recipes || [], preferredCuisines),
      warnings: mergeWarnings(warnings, response.warnings),
    }
  } catch {
    try {
      const parsed = parseRecipeResponseJson(jsonText)
      response = {
        recipes: await enrichFromRecipesList(parsed.recipes, preferredCuisines),
        warnings,
      }
    } catch {
      throw new Error("Failed to generate today's picks.")
    }
  }

  const normalized = normalizeResponse(response)

  const used = extractUsedIngredients(chosenByMeal)
  try {
    await supabase.from("today_picks_cache").delete().eq("user_id", userId).eq("pick_date", pickDate)
    await supabase.from("today_picks_cache").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      pick_date: pickDate,
      fridge_hash: fHash,
      response_json: JSON.stringify(normalized),
      used_ingredients_json: JSON.stringify(used),
    })
  } catch {
    /* cache best-effort */
  }

  return normalized
}
