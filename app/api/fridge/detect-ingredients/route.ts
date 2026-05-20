import { NextResponse } from "next/server"
import { requireBearerUser } from "@/lib/server/auth-request"
import { detectIngredientsFromFiles } from "@/lib/server/detect-ingredients"
import { abortAwareCatch, abortedResponse } from "@/lib/server/route-abort"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const signal = req.signal
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error
  const form = await req.formData()
  const files = form.getAll("images").filter((v): v is File => typeof v !== "string" && v != null && "arrayBuffer" in v)
  try {
    const res = await detectIngredientsFromFiles(files as File[], signal)
    if (signal.aborted) return abortedResponse()
    return NextResponse.json(res)
  } catch (e) {
    const aborted = abortAwareCatch(e)
    if (aborted) return aborted
    if (signal.aborted) return abortedResponse()
    const msg = e instanceof Error ? e.message : "Detection failed"
    return NextResponse.json({ error: msg, message: msg }, { status: 400 })
  }
}
