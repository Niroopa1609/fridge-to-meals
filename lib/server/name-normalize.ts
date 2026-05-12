/** Title-case each whitespace-delimited word (matches Spring NameNormalizer). */
export function toTitleCaseWords(raw: string | null | undefined): string {
  if (raw == null) return ""
  const trimmed = raw.trim()
  if (!trimmed) return ""
  const words = trimmed.split(/\s+/).filter(Boolean)
  const out: string[] = []
  for (const w of words) {
    const lower = w.toLowerCase()
    const titled = lower.charAt(0).toUpperCase() + lower.slice(1)
    out.push(titled)
  }
  return out.join(" ")
}
