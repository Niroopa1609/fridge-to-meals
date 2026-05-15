import { NextResponse } from "next/server"
import { resetPasswordWithToken } from "@/lib/server/password-reset"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { token?: string; password?: string }
    const token = body.token?.trim() || ""
    const password = body.password || ""
    if (!token || password.length < 8) {
      return NextResponse.json(
        { error: "A valid reset link and a password of at least 8 characters are required." },
        { status: 400 }
      )
    }

    const ok = await resetPasswordWithToken(token, password)
    if (!ok) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 })
    }

    return NextResponse.json({ message: "Your password has been updated. You can sign in now." })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Password reset failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
