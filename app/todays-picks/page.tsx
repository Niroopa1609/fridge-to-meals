"use client"

import { Header } from "@/components/header"
import { DecorativeLeaves } from "@/features/recipe-generator/components/decorative-leaves"
import { MobileNav } from "@/components/mobile-nav"
import { TodaysPicksSection } from "@/features/todays-picks/components/todays-picks-section"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/context/auth-context"

export default function TodaysPicksPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("today")
  const { isHydrated, user, accessToken } = useAuth()

  useEffect(() => {
    if (!isHydrated) return
    if (user && accessToken) return
    window.dispatchEvent(new Event("auth:signin"))
    router.replace("/")
  }, [accessToken, isHydrated, router, user])

  return (
    <div className="relative min-h-screen bg-[#F7F3EB] pb-20">
      <DecorativeLeaves />
      <Header />

      <main className="mx-auto max-w-[1440px] px-8 py-6 sm:py-8 lg:px-12 xl:px-16">
        <TodaysPicksSection />
      </main>

      <MobileNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab === "today") router.push("/todays-picks")
          if (tab === "fridge") router.push("/my-fridge")
          if (tab === "planner") router.push("/")
          if (tab === "favorites") router.push("/favorites")
        }}
      />
    </div>
  )
}

