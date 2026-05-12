import { generateJsonTextFromImages } from "@/lib/server/openaiClient"

export const MAX_IMAGES = 3
export const MAX_BYTES_PER_IMAGE = 5 * 1024 * 1024
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const ALLOWED_CATEGORIES = new Set(["Vegetables", "Fruits", "Dairy", "Proteins", "Pantry", "Others"])

const PROMPT = `You analyze grocery or refrigerator photos. Identify only clearly visible food or grocery ingredients.

Rules:
- List only food items (produce, meat, dairy, eggs, packaged food where the product is visible). Omit shelves, bags, boxes, brands, utensils, appliances, and containers unless the food inside is clearly identifiable as a distinct ingredient.
- Categories must be exactly one of: Vegetables, Fruits, Dairy, Proteins, Pantry, Others.
- Normalize names for display: title case or natural singular/plural as appropriate (e.g. tomatoes -> Tomato, eggs -> Eggs).
- One entry per distinct ingredient; remove duplicates.
- confidence must be one of: High, Medium, Low. Use Low when unsure.
- Return a single JSON object with this exact shape, no markdown, no code fences, no extra keys:
{"ingredients":[{"name":"string","category":"Vegetables","confidence":"High"}]}
`

function stripMarkdownFence(s: string): string {
  let t = s.trim()
  if (t.startsWith("```")) {
    const firstNl = t.indexOf("\n")
    if (firstNl > 0) t = t.slice(firstNl + 1)
    const fence = t.lastIndexOf("```")
    if (fence >= 0) t = t.slice(0, fence)
    t = t.trim()
  }
  return t
}

function normalizeCategory(raw: string): string {
  const c = raw?.trim() || ""
  if (ALLOWED_CATEGORIES.has(c)) return c
  return "Others"
}

export type DetectedIngredient = { name: string; category: string; confidence?: string | null }

export async function detectIngredientsFromFiles(files: File[]): Promise<{ ingredients: DetectedIngredient[] }> {
  if (!files.length) {
    throw new Error("Select at least one image (JPG, PNG, or WebP, up to 5 MB each, max 3 images).")
  }
  if (files.length > MAX_IMAGES) {
    throw new Error(`You can upload at most ${MAX_IMAGES} images per detection.`)
  }

  const dataUrls: string[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    if (!file.size) {
      throw new Error(`Image ${i + 1} is empty. Choose a valid image file.`)
    }
    if (file.size > MAX_BYTES_PER_IMAGE) {
      throw new Error(`Each image must be at most 5 MB. "${file.name || "upload"}" is too large.`)
    }
    const contentType = (file.type || "").toLowerCase()
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      throw new Error(`Only JPG, JPEG, PNG, and WebP images are allowed. Invalid type for "${file.name || "upload"}".`)
    }
    const buf = Buffer.from(await file.arrayBuffer())
    if (!buf.length) {
      throw new Error(`Image "${file.name || "upload"}" is empty.`)
    }
    const b64 = buf.toString("base64")
    dataUrls.push(`data:${contentType};base64,${b64}`)
  }

  let rawJson: string
  try {
    rawJson = await generateJsonTextFromImages(PROMPT, dataUrls)
  } catch {
    throw new Error("Ingredient detection failed. Please try again in a moment.")
  }

  const trimmed = stripMarkdownFence(rawJson)
  let root: { ingredients?: unknown }
  try {
    root = JSON.parse(trimmed) as { ingredients?: unknown }
  } catch {
    throw new Error("Could not read detection results. Please try again.")
  }
  if (!Array.isArray(root.ingredients)) {
    throw new Error("Could not read detection results. Please try again.")
  }

  const byLower = new Map<string, DetectedIngredient>()
  for (const node of root.ingredients) {
    if (!node || typeof node !== "object") continue
    const o = node as Record<string, unknown>
    const name = String(o.name ?? "").trim()
    if (!name) continue
    const category = normalizeCategory(String(o.category ?? ""))
    let confidence = String(o.confidence ?? "").trim()
    if (!confidence) confidence = "Low"
    const key = name.toLowerCase()
    if (!byLower.has(key)) {
      byLower.set(key, { name, category, confidence })
    }
  }
  return { ingredients: [...byLower.values()] }
}
