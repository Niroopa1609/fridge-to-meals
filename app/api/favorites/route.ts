import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBearerUser } from "@/lib/server/auth-request"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("favorite_recipes")
    .select("id, title, image_url, meal_type, prep_time, difficulty, main_ingredients, recipe_json, photographer, photographer_url, created_at")
    .eq("user_id", auth.user.uid)
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = (data || []).map((f) => ({
    id: f.id,
    title: f.title,
    imageUrl: f.image_url,
    mealType: f.meal_type,
    prepTime: f.prep_time,
    difficulty: f.difficulty,
    mainIngredients: f.main_ingredients,
    recipeJson: f.recipe_json,
    photographer: f.photographer,
    photographerUrl: f.photographer_url,
    createdAt: f.created_at,
  }))
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error
  const body = (await req.json()) as {
    recipe?: unknown
    title?: string
    imageUrl?: string
    mealType?: string
    prepTime?: string
    difficulty?: string
    mainIngredients?: string[]
    photographer?: string
    photographerUrl?: string
  }
  const title = (body.title || "").trim()
  if (!title || !body.mealType?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  const prepTime = body.prepTime ?? ""
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from("favorite_recipes")
    .select("id")
    .eq("user_id", auth.user.uid)
    .eq("title", title)
    .eq("meal_type", body.mealType.trim())
    .eq("prep_time", prepTime)
    .maybeSingle()
  if (existing?.id) {
    return NextResponse.json({ id: existing.id, saved: false })
  }
  const mainIngredients =
    body.mainIngredients == null ? "" : body.mainIngredients.filter(Boolean).join(", ")
  const { data: saved, error } = await supabase
    .from("favorite_recipes")
    .insert({
      id: crypto.randomUUID(),
      user_id: auth.user.uid,
      recipe_json: body.recipe ?? {},
      title,
      image_url: body.imageUrl ?? null,
      meal_type: body.mealType.trim(),
      prep_time: prepTime || null,
      difficulty: body.difficulty ?? null,
      main_ingredients: mainIngredients || null,
      photographer: body.photographer ?? null,
      photographer_url: body.photographerUrl ?? null,
    })
    .select("id")
    .single()
  if (error || !saved) {
    return NextResponse.json({ error: error?.message || "Save failed" }, { status: 400 })
  }
  return NextResponse.json({ id: saved.id, saved: true })
}
