import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Today's Picks",
  description: "Daily meal suggestions based on your fridge and preferences.",
  alternates: { canonical: "/todays-picks" },
}

export default function TodaysPicksLayout({ children }: { children: ReactNode }) {
  return children
}
