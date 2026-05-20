import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Favorites",
  description:
    "Save your best dinner recipes, weeknight meals, and go-to home cooking ideas.",
  alternates: { canonical: "/favorites" },
}

export default function FavoritesLayout({ children }: { children: ReactNode }) {
  return children
}
