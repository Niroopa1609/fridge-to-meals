import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBearerUser } from "@/lib/server/auth-request"

export const runtime = "nodejs"

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error
  const { id } = await ctx.params
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const supabase = createAdminClient()
  const { data: row } = await supabase.from("favorite_recipes").select("id, user_id").eq("id", id).maybeSingle()
  if (!row || row.user_id !== auth.user.uid) {
    return NextResponse.json({ error: "Favorite not found" }, { status: 400 })
  }
  const { error } = await supabase.from("favorite_recipes").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
