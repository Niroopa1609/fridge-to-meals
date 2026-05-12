import { NextResponse } from "next/server"
import { requireBearerUser } from "@/lib/server/auth-request"
import { detectIngredientsFromFiles } from "@/lib/server/detect-ingredients"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error
  const form = await req.formData()
  const files = form.getAll("images").filter((v): v is File => typeof v !== "string" && v != null && "arrayBuffer" in v)
  try {
    const res = await detectIngredientsFromFiles(files as File[])
    return NextResponse.json(res)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Detection failed"
    return NextResponse.json({ error: msg, message: msg }, { status: 400 })
  }
}
