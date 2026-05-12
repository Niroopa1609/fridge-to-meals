import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBearerUser } from "@/lib/server/auth-request"

export const runtime = "nodejs"

export async function DELETE(req: Request) {
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("fridge_items").delete().eq("user_id", auth.user.uid).select("id")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ removed: data?.length ?? 0 })
}
