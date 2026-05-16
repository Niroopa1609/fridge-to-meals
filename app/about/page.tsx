import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "About Us | Fridge To Meals",
  description: "Learn about Fridge To Meals and how we help you plan meals from what you have.",
}

export default function AboutPage() {
  redirect("/terms?open=about")
}
