import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Privacy Policy | Fridge To Meals",
  description: "Privacy policy for Fridge To Meals.",
}

export default function PrivacyPage() {
  redirect("/terms?open=privacy")
}
