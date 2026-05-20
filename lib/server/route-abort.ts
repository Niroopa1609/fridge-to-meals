import { NextResponse } from "next/server"
import { isAbortError } from "@/lib/abort"

/** HTTP 499 — client closed request (common when fetch is aborted). */
export function abortedResponse(): NextResponse {
  return new NextResponse(null, { status: 499 })
}

export function abortAwareCatch(e: unknown): NextResponse | null {
  if (isAbortError(e)) return abortedResponse()
  return null
}
