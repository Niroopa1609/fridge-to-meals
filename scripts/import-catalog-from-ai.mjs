00/**
 * Import catalog recipes: AI-generated content + Pexels images.
 *
 *   node scripts/import-catalog-from-ai.mjs --cuisine=Indian --replace --preset=indian
 *   node scripts/import-catalog-from-ai.mjs --cuisine=Indian --replace --titles="Butter Chicken,Dal Tadka"
 *   node scripts/import-catalog-from-ai.mjs --cuisine=Indian --replace --preset=indian --limit=3
 *   node scripts/import-catalog-from-ai.mjs --cuisine=Indian --replace --preset=indian --start-from=10
 *
 * Env (.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   OPENAI_API_KEY, PEXELS_API_KEY (optional)
 *
 * This script uses gpt-4o-mini only (not OPENAI_MODEL). Override:
 *   CATALOG_IMPORT_OPENAI_MODEL=gpt-4o-mini  or  --model=gpt-4o-mini
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"
import { INDIAN_RECIPE_TITLES } from "./indian-recipe-titles.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

/** Import script only — app runtime still uses OPENAI_MODEL from .env.local */
const DEFAULT_CATALOG_IMPORT_MODEL = "gpt-4o-mini"

const PANTRY_NAMES = [
  "Chicken",
  "Eggs",
  "Paneer",
  "Fish",
  "Shrimp",
  "Rice",
  "Oats",
  "Bread",
  "Pasta",
  "Noodles",
  "Capsicum",
  "Corn",
  "Spinach",
  "Mushroom",
  "Broccoli",
  "Onion",
  "Tomato",
  "Potato",
  "Carrot",
  "Beans",
  "Lentils",
  "Chickpeas",
  "Tofu",
  "Milk",
  "Yogurt",
  "Cheese",
]

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const i = trimmed.indexOf("=")
    if (i === -1) continue
    const key = trimmed.slice(0, i).trim()
    let val = trimmed.slice(i + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120)
}

function tokenize(name) {
  return name.trim().toLowerCase()
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function parseArgs() {
  const cuisine = process.argv.find((a) => a.startsWith("--cuisine="))?.split("=")[1] || "Indian"
  const titlesArg = process.argv.find((a) => a.startsWith("--titles="))?.split("=")[1]
  const preset = process.argv.includes("--preset=indian")
  const replace = process.argv.includes("--replace")
  const dryRun = process.argv.includes("--dry-run")
  const continueOnError = process.argv.includes("--continue")
  const limit = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] || "0") || null
  const startFrom = Number(process.argv.find((a) => a.startsWith("--start-from="))?.split("=")[1] || "0") || 0
  const delayMs = Number(process.argv.find((a) => a.startsWith("--delay-ms="))?.split("=")[1] || "2500") || 2500

  let titles = []
  if (preset) titles = [...INDIAN_RECIPE_TITLES]
  if (titlesArg) {
    titles = titlesArg.split(",").map((t) => t.trim()).filter(Boolean)
  }
  if (!preset && !titlesArg) {
    console.error("Provide --preset=indian or --titles=\"Recipe A,Recipe B\"")
    process.exit(1)
  }

  const slice = titles.slice(startFrom, limit ? startFrom + limit : undefined)
  return { cuisine, titles: slice, replace, dryRun, continueOnError, delayMs, startFrom, total: titles.length }
}

function buildPrompt(cuisine, title) {
  return `You are creating one catalog recipe for a meal planner app.

Cuisine: ${cuisine}
Dish title: ${title}

Rules:
- Authentic ${cuisine} home-style recipe.
- "mealType" must be one of: Breakfast, Lunch, Dinner, Soup, Salad, Snack, Appetizer, Finger Food, Kids Lunch Box.
- "requiredIngredients" must be 2-6 items chosen ONLY from this pantry list (exact spelling): ${JSON.stringify(PANTRY_NAMES)}
- These are ingredients the user must have in their fridge for this dish to match.
- "ingredients" in the recipe can include pantry staples (salt, oil, spices, water) plus the required items.
- "instructions" must have 5-8 clear steps.
- "proTips" must have 2-3 tips.
- "difficulty": EASY, MEDIUM, or HARD.
- "isVegetarian": boolean.

Return ONLY valid JSON object (no markdown):
{
  "requiredIngredients": ["Chicken", "Tomato"],
  "recipe": {
    "title": "${title}",
    "mealType": "Dinner",
    "difficulty": "MEDIUM",
    "time": "45 minutes",
    "servings": 4,
    "isVegetarian": false,
    "description": "2 sentences.",
    "ingredients": ["1 lb chicken", "2 tomatoes", "1 onion", "spices"],
    "instructions": ["step 1", "step 2"],
    "proTips": ["tip 1"],
    "nutrition": { "calories": 400, "protein": "25g", "carbs": "30g", "fat": "18g" }
  }
}`
}

function catalogImportModel() {
  const fromCli = process.argv.find((a) => a.startsWith("--model="))?.split("=")[1]?.trim()
  return (
    fromCli ||
    process.env.CATALOG_IMPORT_OPENAI_MODEL?.trim() ||
    DEFAULT_CATALOG_IMPORT_MODEL
  )
}

async function generateRecipeJson(cuisine, title, model) {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com").replace(/\/$/, "")
  if (!apiKey) throw new Error("OPENAI_API_KEY required")

  const res = await fetch(`${baseUrl}/v1/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: buildPrompt(cuisine, title),
      store: false,
      text: { format: { type: "json_object" } },
    }),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new Error(`OpenAI ${res.status}${t ? ` ${t.slice(0, 200)}` : ""}`)
  }
  const json = await res.json()
  const text = extractOpenAiText(json)
  return JSON.parse(text.trim())
}

function extractOpenAiText(response) {
  const outputObj = response.output
  if (Array.isArray(outputObj)) {
    for (const item of outputObj) {
      if (!item || typeof item !== "object") continue
      if (String(item.type) !== "message") continue
      const contentObj = item.content
      if (!Array.isArray(contentObj)) continue
      for (const part of contentObj) {
        if (part?.type === "output_text" && part.text != null) return String(part.text)
      }
    }
  }
  throw new Error("OpenAI response missing text")
}

async function fetchPexelsImage(title, cuisine, mealType) {
  const apiKey = process.env.PEXELS_API_KEY?.trim()
  if (!apiKey) {
    return { imageUrl: "/images/default-food.jpg", imageAlt: "", photographer: "", photographerUrl: "" }
  }
  const query = `${title} ${cuisine} ${mealType} indian food plate`
  const params = new URLSearchParams({ query, per_page: "1", orientation: "landscape" })
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: apiKey },
  })
  if (!res.ok) {
    return { imageUrl: "/images/default-food.jpg", imageAlt: "", photographer: "", photographerUrl: "" }
  }
  const root = await res.json()
  const photos = root.photos
  if (!Array.isArray(photos) || photos.length === 0) {
    return { imageUrl: "/images/default-food.jpg", imageAlt: "", photographer: "", photographerUrl: "" }
  }
  const first = photos[0]
  return {
    imageUrl: first?.src?.large || "/images/default-food.jpg",
    imageAlt: String(first?.alt ?? title),
    photographer: String(first?.photographer ?? ""),
    photographerUrl: String(first?.photographer_url ?? ""),
  }
}

function normalizeRecipe(slug, cuisine, parsed, imageMeta) {
  const r = parsed.recipe || parsed
  const title = String(r.title || parsed.title || slug).trim()
  const mealType = String(r.mealType || "Dinner").trim()
  const required = Array.isArray(parsed.requiredIngredients)
    ? parsed.requiredIngredients.map(String).filter(Boolean)
    : []

  const recipeJson = {
    id: `catalog-${slug}`,
    title,
    image: imageMeta.imageUrl,
    mealType,
    difficulty: String(r.difficulty || "MEDIUM"),
    time: String(r.time || "30 minutes"),
    servings: Number(r.servings) || 4,
    isVegetarian: Boolean(r.isVegetarian),
    description: String(r.description || ""),
    ingredients: Array.isArray(r.ingredients) ? r.ingredients.map(String) : [],
    instructions: Array.isArray(r.instructions) ? r.instructions.map(String) : [],
    proTips: Array.isArray(r.proTips) ? r.proTips.map(String) : [],
    nutrition: {
      calories: Number(r.nutrition?.calories) || 0,
      protein: String(r.nutrition?.protein ?? ""),
      carbs: String(r.nutrition?.carbs ?? ""),
      fat: String(r.nutrition?.fat ?? ""),
    },
  }

  return { title, mealType, required, recipeJson }
}

loadEnvLocal()

const { cuisine, titles, replace, dryRun, continueOnError, delayMs, startFrom, total } = parseArgs()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(url, key)
const importModel = catalogImportModel()

console.info(`OpenAI model (catalog import only): ${importModel}`)
console.info(`Cuisine: ${cuisine}`)
console.info(`Titles to import: ${titles.length} (from index ${startFrom} of ${total})`)
if (dryRun) console.info("DRY RUN — no DB writes")

if (replace && !dryRun) {
  const { error: delErr, count } = await supabase
    .from("catalog_recipes")
    .delete({ count: "exact" })
    .eq("cuisine", cuisine)
  if (delErr) {
    console.error("Failed to delete existing recipes:", delErr.message)
    process.exit(1)
  }
  console.info(`Removed existing ${cuisine} catalog recipes (${count ?? "?"} rows).`)
}

let ok = 0
let failed = 0
let skipped = 0

for (let i = 0; i < titles.length; i++) {
  const title = titles[i]
  const slug = `${slugify(cuisine)}-${slugify(title)}`
  const idx = startFrom + i + 1
  console.info(`[${idx}/${total}] ${title}…`)

  try {
    const { data: existing } = await supabase.from("catalog_recipes").select("id").eq("slug", slug).maybeSingle()
    if (existing?.id && !replace) {
      console.info("  skip (slug exists)")
      skipped++
      continue
    }

    const parsed = await generateRecipeJson(cuisine, title, importModel)
    const mealType = String(parsed?.recipe?.mealType || parsed?.mealType || "Dinner")
    const imageMeta = await fetchPexelsImage(title, cuisine, mealType)
    const { title: normTitle, mealType: normMeal, required, recipeJson } = normalizeRecipe(
      slug,
      cuisine,
      parsed,
      imageMeta
    )

    if (dryRun) {
      console.info("  ok (dry-run)", normTitle, "| required:", required.join(", "))
      ok++
      await sleep(delayMs)
      continue
    }

    if (existing?.id) {
      await supabase.from("catalog_recipes").delete().eq("id", existing.id)
    }

    const { data: row, error } = await supabase
      .from("catalog_recipes")
      .insert({
        slug,
        title: normTitle,
        cuisine,
        meal_type: normMeal,
        prep_time_bucket: null,
        cooking_style: null,
        is_vegetarian: Boolean(recipeJson.isVegetarian),
        recipe_json: recipeJson,
        image_url: imageMeta.imageUrl,
        image_alt: imageMeta.imageAlt || `${normTitle} — ${cuisine} food`,
        photographer: imageMeta.photographer,
        photographer_url: imageMeta.photographerUrl,
        source: "ai-import",
      })
      .select("id")
      .single()

    if (error || !row?.id) throw new Error(error?.message || "insert failed")

    const ingRows = []
    const seen = new Set()
    for (const name of required) {
      const tok = tokenize(name)
      if (!tok || seen.has(tok)) continue
      seen.add(tok)
      ingRows.push({ recipe_id: row.id, ingredient_token: tok, is_required: true })
    }
    if (ingRows.length === 0) {
      throw new Error("no requiredIngredients from AI")
    }

    const { error: ingErr } = await supabase.from("catalog_recipe_ingredients").insert(ingRows)
    if (ingErr) throw new Error(ingErr.message)

    console.info("  saved", slug)
    ok++
  } catch (e) {
    failed++
    console.error("  FAILED:", e instanceof Error ? e.message : e)
    if (!continueOnError) process.exit(1)
  }

  if (i < titles.length - 1) await sleep(delayMs)
}

console.info(`Done. ok=${ok} failed=${failed} skipped=${skipped}`)
