import type { Metadata } from "next"
import { MyFridgePage } from "@/features/fridge/my-fridge-page"

export const metadata: Metadata = {
  title: "My Fridge",
  description:
    "Pantry and fridge inventory for home cooks—save ingredients and get recipes that use what you have.",
  alternates: { canonical: "/my-fridge" },
}

export default function Page() {
  return <MyFridgePage />
}
