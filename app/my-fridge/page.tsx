import type { Metadata } from "next"
import { MyFridgePage } from "@/features/fridge/my-fridge-page"

export const metadata: Metadata = {
  title: "My Fridge",
  description: "Save and manage ingredients in your pantry for faster recipe ideas.",
  alternates: { canonical: "/my-fridge" },
}

export default function Page() {
  return <MyFridgePage />
}
