import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Today's Picks",
  description:
    "Daily dinner and lunch ideas from your fridge—what to cook today without the guesswork.",
  alternates: { canonical: "/todays-picks" },
}

export default function TodaysPicksLayout({ children }: { children: ReactNode }) {
  return children
}
