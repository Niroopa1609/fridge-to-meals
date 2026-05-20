/** Normalize user/catalog ingredient names to lowercase match tokens. */
export function ingredientToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ")
}

export function ingredientTokens(values: string[]): Set<string> {
  const out = new Set<string>()
  for (const v of values) {
    const t = ingredientToken(v)
    if (t) out.add(t)
  }
  return out
}
