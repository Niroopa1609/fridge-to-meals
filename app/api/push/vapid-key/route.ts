import { NextResponse } from "next/server"
import { getVapidPublicKey, isWebPushConfigured } from "@/lib/server/web-push"

export const runtime = "nodejs"

export async function GET() {
  if (!isWebPushConfigured()) {
    return NextResponse.json({ enabled: false, publicKey: null })
  }
  return NextResponse.json({ enabled: true, publicKey: getVapidPublicKey() })
}
