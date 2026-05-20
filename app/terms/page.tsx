import type { Metadata } from "next"
import { Suspense } from "react"
import { TermsHubPage } from "@/features/terms/terms-hub-page"

export const metadata: Metadata = {
  title: "Terms",
  description:
    "About Fridge To Meals meal planner and recipe generator, terms of use, privacy, and support.",
  alternates: { canonical: "/terms" },
}

export default function TermsRoutePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F8F5EF]" aria-hidden />}>
      <TermsHubPage />
    </Suspense>
  )
}
