import { NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/server/jwt"

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function getBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization") || req.headers.get("Authorization")
  if (!h?.toLowerCase().startsWith("bearer ")) return null
  const t = h.slice(7).trim()
  return t || null
}

export async function requireBearerUser(req: Request) {
  const token = getBearerToken(req)
  if (!token) return { error: jsonError("Unauthorized", 401) }
  const user = await verifyAccessToken(token)
  if (!user) return { error: jsonError("Unauthorized", 401) }
  return { user }
}
