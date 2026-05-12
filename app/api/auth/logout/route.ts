import { NextResponse } from "next/server"
import { revokeRefreshToken } from "@/lib/server/auth-session"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { refreshToken?: string }
    const refreshToken = body.refreshToken?.trim()
    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
