import { NextResponse } from "next/server"
import { transcribeAudioWebm } from "@/lib/server/openaiClient"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const audio = form.get("audio")
    if (!audio || typeof audio === "string") {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }
    const file = audio as File
    const buf = new Uint8Array(await file.arrayBuffer())
    if (buf.length < 32) {
      return NextResponse.json({ error: "Audio is too small" }, { status: 400 })
    }
    const name = file.name?.trim() || "recording.webm"
    const text = await transcribeAudioWebm(buf, name)
    return NextResponse.json({ text })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Transcription failed"
    const status = msg.includes("not configured") ? 503 : 502
    return NextResponse.json({ error: msg }, { status })
  }
}
