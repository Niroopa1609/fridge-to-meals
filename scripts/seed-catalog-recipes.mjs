/**
 * Seed catalog_recipes + catalog_recipe_ingredients.
 *
 *   node scripts/seed-catalog-recipes.mjs
 *   node scripts/seed-catalog-recipes.mjs --cuisine=Indian --count=100
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"
import { CUISINE_IMAGES, SEED_RECIPES } from "./catalog-seed-data.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

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

function tokenize(name) {
  return name.trim().toLowerCase()
}

function buildRecipeJson(def) {
  const time = def.time || "30 minutes"
  const ings = [...def.required, ...(def.optional || [])]
  return {
    id: `catalog-${def.slug}`,
    title: def.title,
    image: CUISINE_IMAGES[def.cuisine] || "/images/default-food.jpg",
    mealType: def.mealType,
    difficulty: "EASY",
    time,
    servings: 2,
    isVegetarian: Boolean(def.isVegetarian),
    description: `${def.title} — a ${def.cuisine} ${def.mealType.toLowerCase()} idea using what you have at home.`,
    ingredients: ings,
    instructions: [
      `Prep and chop ${def.required.join(", ")}.`,
      `Cook the dish using your preferred ${def.cuisine} seasonings until done.`,
      "Taste, adjust salt and spice, and serve warm.",
    ],
    proTips: ["Use pantry spices you already have.", "Double the recipe to meal-prep for tomorrow."],
    nutrition: { calories: 320, protein: "18g", carbs: "35g", fat: "12g" },
  }
}

/** Expand batch recipes for --count > base set (template variants). */
function expandForCuisine(cuisine, count) {
  const base = SEED_RECIPES.filter((r) => r.cuisine === cuisine)
  if (base.length === 0) return []
  const out = [...base]
  let i = 0
  while (out.length < count) {
    const src = base[i % base.length]
    const n = Math.floor(out.length / base.length) + 1
    out.push({
      ...src,
      slug: `${src.slug}-v${n}`,
      title: `${src.title} (${n})`,
    })
    i++
  }
  return out.slice(0, count)
}

function parseArgs() {
  const cuisine = process.argv.find((a) => a.startsWith("--cuisine="))?.split("=")[1]
  const countRaw = process.argv.find((a) => a.startsWith("--count="))?.split("=")[1]
  const count = countRaw ? Number(countRaw) : null
  return { cuisine, count }
}

loadEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const { cuisine, count } = parseArgs()
let recipes = SEED_RECIPES
if (cuisine && count && count > 0) {
  recipes = expandForCuisine(cuisine, count)
  console.info(`Seeding ${recipes.length} recipes for cuisine=${cuisine}`)
} else {
  console.info(`Seeding ${recipes.length} base catalog recipes`)
}

const supabase = createClient(url, key)

let inserted = 0
let skipped = 0

for (const def of recipes) {
  const imageUrl = CUISINE_IMAGES[def.cuisine] || "/images/default-food.jpg"
  const recipeJson = buildRecipeJson(def)

  const { data: existing } = await supabase.from("catalog_recipes").select("id").eq("slug", def.slug).maybeSingle()
  if (existing?.id) {
    skipped++
    continue
  }

  const { data: row, error } = await supabase
    .from("catalog_recipes")
    .insert({
      slug: def.slug,
      title: def.title,
      cuisine: def.cuisine,
      meal_type: def.mealType,
      prep_time_bucket: def.prepTime || null,
      cooking_style: def.cookingStyle || null,
      is_vegetarian: Boolean(def.isVegetarian),
      recipe_json: recipeJson,
      image_url: imageUrl,
      image_alt: `${def.title} — ${def.cuisine} food`,
      source: "seed",
    })
    .select("id")
    .single()

  if (error || !row?.id) {
    console.error("Insert failed", def.slug, error?.message)
    process.exit(1)
  }

  const ingRows = []
  for (const name of def.required) {
    ingRows.push({ recipe_id: row.id, ingredient_token: tokenize(name), is_required: true })
  }
  for (const name of def.optional || []) {
    ingRows.push({ recipe_id: row.id, ingredient_token: tokenize(name), is_required: false })
  }

  const { error: ingErr } = await supabase.from("catalog_recipe_ingredients").insert(ingRows)
  if (ingErr) {
    console.error("Ingredients failed", def.slug, ingErr.message)
    process.exit(1)
  }
  inserted++
}

console.info(`Done. inserted=${inserted} skipped=${skipped}`)
