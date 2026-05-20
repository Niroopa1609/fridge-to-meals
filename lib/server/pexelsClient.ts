export type PexelImageMeta = {
  imageUrl: string
  imageAlt: string
  photographer: string
  photographerUrl: string
}

function fallbackImage(): string {
  return "/images/default-food.jpg"
}

export async function findRecipeImageMeta(
  dishName: string,
  cuisine: string,
  mealType: string,
  signal?: AbortSignal
): Promise<PexelImageMeta> {
  const apiKey = process.env.PEXELS_API_KEY?.trim()
  if (!apiKey) {
    return { imageUrl: fallbackImage(), imageAlt: "", photographer: "", photographerUrl: "" }
  }
  const query = `${dishName} ${cuisine} ${mealType} food in a plate or bowl in wooden background`
  const params = new URLSearchParams({ query, per_page: "1", orientation: "landscape" })
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?${params.toString()}`, {
      headers: { Authorization: apiKey },
      signal,
    })
    if (!res.ok) {
      return { imageUrl: fallbackImage(), imageAlt: "", photographer: "", photographerUrl: "" }
    }
    const root = (await res.json()) as {
      photos?: { src?: { large?: string }; alt?: string; photographer?: string; photographer_url?: string }[]
    }
    const photos = root.photos
    if (!Array.isArray(photos) || photos.length === 0) {
      return { imageUrl: fallbackImage(), imageAlt: "", photographer: "", photographerUrl: "" }
    }
    const first = photos[0]
    const imageUrl = first?.src?.large || fallbackImage()
    return {
      imageUrl,
      imageAlt: String(first?.alt ?? ""),
      photographer: String(first?.photographer ?? ""),
      photographerUrl: String(first?.photographer_url ?? ""),
    }
  } catch {
    return { imageUrl: fallbackImage(), imageAlt: "", photographer: "", photographerUrl: "" }
  }
}

export async function findRecipeImageUrl(
  dishName: string,
  cuisine: string,
  mealType: string,
  signal?: AbortSignal
): Promise<string> {
  const m = await findRecipeImageMeta(dishName, cuisine, mealType, signal)
  return m.imageUrl || fallbackImage()
}
