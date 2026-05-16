import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Edge-safe sliding-window limiter (best-effort per serverless instance).
 * Reduces casual abuse of auth endpoints without external Redis.
 */
const buckets = new Map<string, number[]>()

function pruneBuckets(cutoffMs: number) {
  const now = Date.now()
  const cutoff = now - cutoffMs
  for (const [key, stamps] of buckets.entries()) {
    const kept = stamps.filter((t) => t > cutoff)
    if (kept.length === 0) buckets.delete(key)
    else buckets.set(key, kept)
  }
}

function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  if (buckets.size > 4000) pruneBuckets(Math.max(windowMs, 60 * 60 * 1000))

  let stamps = buckets.get(key)
  if (!stamps) {
    stamps = []
    buckets.set(key, stamps)
  }
  const cutoff = now - windowMs
  while (stamps.length && stamps[0]! < cutoff) stamps.shift()
  if (stamps.length >= limit) return false
  stamps.push(now)
  return true
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-DNS-Prefetch-Control", "on")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(), interest-cohort=()"
  )
}

export function proxy(request: NextRequest) {
  const res = NextResponse.next()
  applySecurityHeaders(res)

  if (request.method !== "POST") return res

  const path = request.nextUrl.pathname
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"

  let ok = true
  if (path === "/api/auth/login") ok = allow(`login:${ip}`, 25, 15 * 60 * 1000)
  else if (path === "/api/auth/signup") ok = allow(`signup:${ip}`, 12, 60 * 60 * 1000)
  else if (path === "/api/auth/forgot-password") ok = allow(`forgot:${ip}`, 8, 60 * 60 * 1000)
  else if (path === "/api/auth/reset-password") ok = allow(`reset:${ip}`, 15, 60 * 60 * 1000)

  if (!ok) {
    const denied = NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    applySecurityHeaders(denied)
    denied.headers.set("Retry-After", "900")
    return denied
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
