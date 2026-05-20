import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Fridge To Meals and how we help you plan meals from what you have.",
  robots: { index: false, follow: true },
}

export default function AboutPage() {
  redirect("/terms?open=about")
}
