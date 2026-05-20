import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your saved recipes from Fridge To Meals.",
  alternates: { canonical: "/favorites" },
}

export default function FavoritesLayout({ children }: { children: ReactNode }) {
  return children
}
