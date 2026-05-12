/** Trim and strip wrapping quotes often pasted into .env files by mistake. */
export function normalizeEnvSecret(raw: string | undefined): string {
  if (raw == null) return ""
  let s = raw.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim()
  }
  return s
}

/**
 * Supabase project URL only (https://<ref>.supabase.co).
 * Strips trailing slashes, optional /rest/v1 suffix, and fixes missing scheme.
 */
export function normalizeSupabaseUrl(raw: string | undefined): string {
  let u = normalizeEnvSecret(raw ?? "")
  if (!u) return ""
  u = u.replace(/\/+$/, "")
  const lower = u.toLowerCase()
  const rest = "/rest/v1"
  const i = lower.indexOf(rest)
  if (i > 0) {
    u = u.slice(0, i).replace(/\/+$/, "")
  }
  if (!/^https?:\/\//i.test(u)) {
    u = `https://${u}`
  }
  try {
    const parsed = new URL(u)
    if (!parsed.hostname) return ""
    if (parsed.hostname.endsWith(".supabase.co")) {
      return `${parsed.protocol}//${parsed.host}`
    }
    const path = parsed.pathname.replace(/\/+$/, "")
    return path && path !== "/" ? `${parsed.origin}${path}` : parsed.origin
  } catch {
    return ""
  }
}
