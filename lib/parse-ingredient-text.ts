/**
 * Splits free-form ingredient text into display tags (title case per word).
 * Handles commas, newlines, slashes, semicolons, pipes, and "and" / "&" list joins.
 */
function toTitleCaseIngredient(phrase: string): string {
  return phrase
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

const AND_SPLIT = /\s+(?:and|&)\s+/i

function splitOnWeakJoiners(segment: string): string[] {
  return segment.split(AND_SPLIT).map((s) => s.trim()).filter(Boolean)
}

const STRONG_SPLIT = /(?:\s*[,;|/]\s*|\s*\n\s*)+/

export function parseIngredientText(raw: string): string[] {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const segments = trimmed
    .replace(/\r\n/g, "\n")
    .split(STRONG_SPLIT)
    .flatMap((s) => splitOnWeakJoiners(s))
    .map((s) => s.trim())
    .filter(Boolean)

  const titled = segments.map(toTitleCaseIngredient)
  return titled
}
