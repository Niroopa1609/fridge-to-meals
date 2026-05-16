"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Pencil, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/context/auth-context"
import { fetchFridgeItems } from "@/features/fridge/services/fridge"
import { fetchTodayPicks } from "@/features/todays-picks/services/todays-picks"
import { normalizeBackendRecipe } from "@/features/recipe-generator/services/recipe-mappers"
import { RecipesSection } from "@/features/recipe-generator/components/recipes-section"
import type { Recipe } from "@/components/recipe-card"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useTodayPicksState } from "@/features/recipes/state/recipes-state"
import { fetchUserPreferences, saveUserPreferences } from "@/features/user-preferences/services/user-preferences"
import { CuisinePicker } from "@/features/user-preferences/components/cuisine-picker"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#E2D9CC] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 animate-pulse rounded bg-[#F7F3EB]" />
        <div className="h-4 w-14 animate-pulse rounded bg-[#F7F3EB]" />
      </div>
      <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-[#F7F3EB]" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#F7F3EB]" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-[#F7F3EB]" />
      <div className="mt-4 h-40 w-full animate-pulse rounded bg-[#F7F3EB]" />
    </div>
  )
}

export function TodaysPicksSection({ className }: { className?: string }) {
  const { accessToken, user, isHydrated } = useAuth()
  const isMobile = useIsMobile()

  const { todayPicks, setTodayPicks } = useTodayPicksState()
  const { fridgeCount, loading, error, warnings, recipes, hasLoaded } = todayPicks
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null)
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([])
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [prefsDraft, setPrefsDraft] = useState<string[]>([])
  const [prefsSaving, setPrefsSaving] = useState(false)

  const canUse = Boolean(isHydrated && user && accessToken)

  const emptyFridge = useMemo(() => fridgeCount === 0, [fridgeCount])

  const load = useCallback(
    async (opts: { refresh: boolean }) => {
      if (!canUse) return
      setTodayPicks({ error: null, loading: true })
      try {
        const items = await fetchFridgeItems(accessToken!)
        setTodayPicks({ fridgeCount: items.length })
        if (items.length === 0) {
          setTodayPicks({ recipes: [], warnings: [], hasLoaded: true })
          return
        }
        const res = await fetchTodayPicks(accessToken!, opts.refresh)
        const next = Array.isArray(res.recipes) ? res.recipes.map(normalizeBackendRecipe) : []
        setTodayPicks({
          recipes: next,
          warnings: Array.isArray(res.warnings) ? res.warnings : [],
          hasLoaded: true,
        })
      } catch (e) {
        setTodayPicks({
          error: e instanceof Error ? e.message : "Could not load today's picks.",
          hasLoaded: true,
        })
      } finally {
        setTodayPicks({ loading: false })
      }
    },
    [accessToken, canUse, setTodayPicks]
  )

  const loadPreferences = useCallback(async () => {
    if (!canUse) return
    try {
      const res = await fetchUserPreferences(accessToken!)
      setPreferredCuisines(Array.isArray(res.preferredCuisines) ? res.preferredCuisines : [])
    } catch {
      setPreferredCuisines([])
    } finally {
      setPrefsLoaded(true)
    }
  }, [accessToken, canUse])

  useEffect(() => {
    if (!canUse) {
      // Keep existing picks in memory; just stop making authenticated calls when logged out.
      setTodayPicks({ loading: false })
      return
    }
    // Don't refetch on every mount/tab switch if we already have picks in state.
    if (hasLoaded && recipes.length > 0 && !loading && !error) return
    void load({ refresh: false })
  }, [canUse, error, hasLoaded, load, loading, recipes.length, setTodayPicks])

  useEffect(() => {
    if (!canUse) return
    if (prefsLoaded) return
    void loadPreferences()
  }, [canUse, loadPreferences, prefsLoaded])

  useEffect(() => {
    setExpandedRecipeId(null)
  }, [recipes.length])

  const openPrefs = () => {
    setPrefsDraft(preferredCuisines)
    setPrefsOpen(true)
  }

  const toggleCuisine = (c: string) => {
    const key = c.toLowerCase()
    const set = new Set(prefsDraft.map((x) => x.toLowerCase()))
    if (set.has(key)) {
      setPrefsDraft((prev) => prev.filter((x) => x.toLowerCase() !== key))
      return
    }
    if (prefsDraft.length >= 3) {
      toast.message("You can select up to 3 cuisines.")
      return
    }
    setPrefsDraft((prev) => [...prev, c])
  }

  const savePrefs = async () => {
    if (!accessToken) return
    setPrefsSaving(true)
    try {
      const res = await saveUserPreferences(accessToken, prefsDraft)
      setPreferredCuisines(res.preferredCuisines ?? prefsDraft)
      setPrefsOpen(false)
      toast.success("Preferences saved.")
      // Refresh picks after preference change
      setTodayPicks({ recipes: [], warnings: [], error: null, hasLoaded: true })
      void load({ refresh: true })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save preferences.")
    } finally {
      setPrefsSaving(false)
    }
  }

  const greetingName = user?.name?.trim() || "there"

  return (
    <section className={cn("mx-auto max-w-[1360px] space-y-4", className)}>
      {/* Greeting — mobile sizes match card hierarchy: ~17px title, ~12px subtitle */}
      <div className="rounded-xl border border-[#E2D9CC] bg-white p-4 shadow-sm sm:p-6">
        <p
          className={cn(
            "min-w-0 max-w-full font-serif font-semibold leading-snug tracking-tight text-[#1F3A2B]",
            "text-[17px] sm:text-lg md:text-xl md:leading-normal md:tracking-normal lg:text-2xl"
          )}
        >
          Here’s what works for you today, {greetingName}! 🌞
        </p>
        <p className="mt-1.5 text-[12px] leading-snug text-[#1F3A2B]/55 sm:text-[13px] md:mt-2 md:text-sm md:text-[#1F3A2B]/60 md:leading-normal">
          From your fridge to your plate.
        </p>
      </div>

      {/* Cuisine preferences */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E2D9CC] bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-snug text-[#1F3A2B] md:text-sm">
            Your Cuisine Preferences
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
            {(preferredCuisines.length > 0 ? preferredCuisines : ["Any"]).map((c) => (
              <span
                key={c}
                className="inline-flex min-h-8 items-center rounded-md border border-[#E2D9CC] bg-[#F7F3EB] px-2.5 py-1 text-[12px] font-medium leading-tight text-[#1F3A2B] sm:h-9 sm:rounded-full sm:px-3 sm:py-0 sm:text-sm"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[12px] leading-snug text-[#1F3A2B]/55 sm:text-[13px] md:mt-2 md:text-sm md:text-[#1F3A2B]/60 md:leading-normal">
            These help us personalize your daily picks.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 border-[#F97316] text-[#F97316] hover:bg-[#FDE9DD] sm:self-start"
          disabled={!canUse}
          onClick={openPrefs}
        >
          <Pencil className="mr-2 h-4 w-4" aria-hidden />
          Change
        </Button>
      </div>

      {!canUse ? null : emptyFridge ? (
        <div className="rounded-xl border border-dashed border-[#E2D9CC] bg-[#FBF8F2] p-6 text-center text-sm text-[#1F3A2B]/70">
          Add ingredients to My Fridge to get daily meal ideas.
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      ) : loading && recipes.length === 0 ? (
        <div className="space-y-3">
          <p className="text-[12px] font-medium text-[#1F3A2B]/75 sm:text-sm">Finding meal ideas from your fridge…</p>
          <div className="grid gap-3 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : recipes.length > 0 ? (
        <>
          {warnings.length > 0 ? (
            <div className="rounded-xl border border-[#E2D9CC] bg-[#FBF8F2] p-4 text-[12px] leading-snug text-[#1F3A2B]/75 sm:text-sm">
              <p className="font-semibold text-[#1F3A2B]">Tips</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {warnings.map((w, idx) => (
                  <li key={`${w}-${idx}`}>{w}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <RecipesSection
            recipes={recipes}
            expandedRecipeId={expandedRecipeId}
            onToggleExpand={(id) => setExpandedRecipeId((cur) => (cur === id ? null : id))}
            isMobile={isMobile}
            title="Today’s picks from your fridge"
            subtitle="Picked from your fridge. Tailored to your taste."
            titleClassName="text-[17px] font-bold leading-snug tracking-tight sm:text-lg md:text-xl lg:text-2xl"
            subtitleClassName="mt-1.5 text-[12px] leading-snug text-[#1F3A2B]/55 sm:text-[13px] md:mt-2 md:text-sm md:text-[#1F3A2B]/60 md:leading-normal"
            rightAction={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 border-[#E2D9CC] font-semibold text-[#1F3A2B] hover:bg-[#F7F3EB]"
                disabled={!canUse || loading || emptyFridge}
                onClick={() => {
                  setTodayPicks({ recipes: [], warnings: [], error: null, hasLoaded: true })
                  void load({ refresh: true })
                }}
              >
                {loading ? "Refreshing…" : "Refresh Picks"}
              </Button>
            }
            hideMobileRecipeBackLink
          />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-[#E2D9CC] bg-[#FBF8F2] p-6 text-center text-sm text-[#1F3A2B]/70">
          Finding meal ideas from your fridge…
        </div>
      )}

      <Dialog open={prefsOpen} onOpenChange={(open) => (!prefsSaving ? setPrefsOpen(open) : null)}>
        <DialogContent
          className={cn(
            "border-[#E2D9CC] bg-[#FAF7F0] p-4 sm:p-6",
            "max-w-[900px]",
            "h-[90vh] sm:h-auto overflow-hidden"
          )}
        >
          <div className="flex h-full flex-col">
            <DialogHeader className="text-left">
              <DialogTitle className="font-serif text-[#1F3A2B]">Update cuisine preferences</DialogTitle>
              <p className="text-sm text-[#1F3A2B]/65">Select up to 3. We’ll personalize your daily picks.</p>
              <p className="mt-2 text-sm font-medium text-[#1F3A2B]/75">{prefsDraft.length}/3 selected</p>
            </DialogHeader>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pb-4">
              <CuisinePicker selected={prefsDraft} max={3} disabled={prefsSaving} onToggle={toggleCuisine} />
            </div>

            <DialogFooter className="sticky bottom-0 bg-[#FAF7F0] pt-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 border-[#E2D9CC] text-[#1F3A2B] hover:bg-[#F7F3EB]"
                disabled={prefsSaving}
                onClick={() => setPrefsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-11 bg-[#F97316] text-white hover:bg-[#F28C38]"
                disabled={prefsSaving}
                onClick={() => void savePrefs()}
              >
                {prefsSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

