"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/context/auth-context"
import { saveUserPreferences } from "@/features/user-preferences/services/user-preferences"
import { CuisinePicker } from "@/features/user-preferences/components/cuisine-picker"

const MAX = 3

export default function CuisineOnboardingPage() {
  const router = useRouter()
  const { isHydrated, user, accessToken } = useAuth()

  const [selected, setSelected] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const selectedSet = useMemo(() => new Set(selected.map((s) => s.toLowerCase())), [selected])
  const canUse = Boolean(isHydrated && user && accessToken)

  const toggle = (cuisine: string) => {
    const key = cuisine.toLowerCase()
    if (selectedSet.has(key)) {
      setSelected((prev) => prev.filter((x) => x.toLowerCase() !== key))
      return
    }
    if (selected.length >= MAX) {
      toast.message("You can select up to 3 cuisines.")
      return
    }
    setSelected((prev) => [...prev, cuisine])
  }

  const save = async (prefs: string[]) => {
    if (!accessToken) return
    setIsSaving(true)
    try {
      await saveUserPreferences(accessToken, prefs)
      router.replace("/")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save preferences.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1060px] px-4 pb-12 pt-8 sm:px-6">
      {/* Header + stepper */}
      <div className="mx-auto max-w-[820px] text-center">
        <div className="flex items-center justify-center gap-2 text-[#1F3A2B]">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[#FDE9DD] text-[#F97316]">
            <Leaf className="h-4 w-4" aria-hidden />
          </div>
          <span className="font-serif text-xl font-semibold">Daily Meal Decider</span>
        </div>

        <div className="mt-4 grid grid-cols-3 items-start gap-3 text-xs text-[#1F3A2B]/60">
          <div className="flex flex-col items-center gap-1">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-[#4F6B1F] text-white">1</div>
            <span className="font-semibold text-[#4F6B1F]">Cuisine Preference</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-[#E8EED8] text-[#1F3A2B]/60">2</div>
            <span>Your Kitchen</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-[#E8EED8] text-[#1F3A2B]/60">3</div>
            <span>You’re All Set!</span>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="mx-auto mt-6 max-w-[860px] rounded-2xl border border-[#E2D9CC] bg-white/90 p-5 shadow-sm backdrop-blur sm:p-8">
        <div className="mx-auto flex max-w-[520px] flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FDE9DD] bg-[#FFF7F1] px-3 py-1 text-xs font-semibold text-[#EA6A12]">
            <span aria-hidden>✨</span> Personalize your meals
          </div>

          <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-[#1F3A2B] sm:text-4xl">
            What flavors do you love?
          </h1>
          <p className="mt-2 text-sm text-[#1F3A2B]/65">
            Select up to 3 cuisines. We’ll personalize your daily picks.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#E2D9CC] pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[#1F3A2B]/75">
            <Leaf className="h-4 w-4 text-[#4F6B1F]" aria-hidden />
            <span>
              {selected.length}/{MAX} selected
            </span>
          </div>
          {!canUse ? (
            <Button
              type="button"
              variant="outline"
              className="border-[#E2D9CC] text-[#1F3A2B] hover:bg-[#F7F3EB]"
              onClick={() => window.dispatchEvent(new Event("auth:signin"))}
            >
              Sign in to continue
            </Button>
          ) : null}
        </div>

        <div className="mt-4">
          <CuisinePicker selected={selected} max={MAX} disabled={!canUse || isSaving} onToggle={toggle} />
        </div>

        <div className="mt-4 rounded-xl border border-[#F97316]/25 bg-[#FFF7F1] px-4 py-3 text-sm text-[#EA6A12]">
          You can select up to 3 cuisines.
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="border-[#E2D9CC] text-[#1F3A2B] hover:bg-[#F7F3EB]"
            disabled={!canUse || isSaving}
            onClick={() => void save([])}
          >
            Skip for now
          </Button>
          <Button
            type="button"
            className="bg-[#F97316] text-white hover:bg-[#F28C38]"
            disabled={!canUse || isSaving || selected.length < 1}
            onClick={() => void save(selected)}
          >
            {isSaving ? "Saving..." : "Continue →"}
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-[#1F3A2B]/65">
          Your choices help us create better <span className="font-semibold text-[#4F6B1F]">Breakfast</span>,{" "}
          <span className="font-semibold text-[#1F3A2B]">Lunch</span>, and{" "}
          <span className="font-semibold text-[#1F3A2B]">Dinner</span> ideas from your fridge.
        </p>
      </div>
    </main>
  )
}

