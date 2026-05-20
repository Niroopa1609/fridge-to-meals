/** Priority cuisines for catalog ranking when user has no cuisine filter. */
export const CATALOG_PRIORITY_CUISINES = [
  "Indian",
  "Chinese",
  "American",
  "Thai",
  "Italian",
] as const

export type CatalogCuisine = (typeof CATALOG_PRIORITY_CUISINES)[number]

export function cuisinePriorityScore(cuisine: string): number {
  const c = cuisine.trim().toLowerCase()
  const idx = CATALOG_PRIORITY_CUISINES.findIndex((x) => x.toLowerCase() === c)
  return idx === -1 ? 100 : idx
}
