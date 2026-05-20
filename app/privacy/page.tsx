import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for Fridge To Meals.",
  robots: { index: false, follow: true },
}

export default function PrivacyPage() {
  redirect("/terms?open=privacy")
}
