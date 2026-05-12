import { NextResponse } from "next/server"
import { rotateRefreshToken } from "@/lib/server/auth-session"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { refreshToken?: string }
    const refreshToken = body.refreshToken?.trim()
    if (!refreshToken) {
      return NextResponse.json({ error: "refreshToken required" }, { status: 400 })
    }
    const ua = req.headers.get("user-agent")
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
    const session = await rotateRefreshToken(refreshToken, { userAgent: ua, ip })
    if (!session) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 400 })
    }
    return NextResponse.json(session)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Refresh failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
