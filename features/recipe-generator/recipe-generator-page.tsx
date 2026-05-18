"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Sparkles, Square } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { IngredientInput } from "@/components/ingredient-input"
import { FilterSection } from "@/components/filter-section"
import { MealTypeSelector } from "@/components/meal-type-selector"
import { MobileNav } from "@/components/mobile-nav"
import { useIsMobile } from "@/components/ui/use-mobile"
import { DecorativeLeaves } from "@/features/recipe-generator/components/decorative-leaves"
import { RecipeHeroBanner } from "@/features/recipe-generator/components/recipe-hero-banner"
import { RecipesSection } from "@/features/recipe-generator/components/recipes-section"
import { useRecipeGenerator } from "@/features/recipe-generator/hooks/use-recipe-generator"
import { useAuth } from "@/features/auth/context/auth-context"
import { fetchFridgeItems } from "@/features/fridge/services/fridge"
import { cn } from "@/lib/utils"

export function RecipeGeneratorPage() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const { accessToken, isHydrated, user } = useAuth()
  const {
    formState,
    setIngredients,
    setCuisine,
    setMealPrepTime,
    setCookingStyle,
    setMealTypeIds,
    recipes,
    isLoading,
    showRecipes,
    canStartGenerate,
    generate,
    cancelGenerate,
  } = useRecipeGenerator()

  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("planner")
  const [fridgeQuickPicks, setFridgeQuickPicks] = useState<string[]>([])

  useEffect(() => {
    if (!isHydrated) return
    if (!user || !accessToken) {
      setFridgeQuickPicks([])
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const items = await fetchFridgeItems(accessToken)
        if (cancelled) return
        setFridgeQuickPicks(items.map((i) => i.name))
      } catch {
        if (cancelled) return
        setFridgeQuickPicks([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [accessToken, isHydrated, user])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === "today") router.push("/todays-picks")
    if (tab === "planner") router.push("/")
    if (tab === "favorites") router.push("/favorites")
    if (tab === "fridge") router.push("/my-fridge")
    if (tab === "terms") router.push("/terms")
  }

  const handleToggleExpand = (recipeId: string) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId)
  }

  const hasIngredients = formState.ingredients.length > 0
  const hasMealType = formState.mealTypeIds.length > 0
  const isGenerateDisabled = !canStartGenerate && !isLoading

  const generateHint = isGenerateDisabled
    ? !hasIngredients && !hasMealType
      ? "Add ingredients and select a meal type"
      : !hasIngredients
        ? "Add at least one ingredient"
        : "Select at least one meal type"
    : "Let AI work its magic ✨"

  return (
    <div className="relative min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#F8F5EF] pb-[5.5rem] sm:pb-24">
      <DecorativeLeaves />
      <Header variant="recipe" />

      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-3 sm:px-6 sm:py-4 lg:max-w-[1200px] lg:px-10 lg:py-5">
        <RecipeHeroBanner />

        <div className="mx-auto w-full min-w-0 space-y-3 sm:space-y-4">
          <IngredientInput
            ingredients={formState.ingredients}
            onIngredientsChange={setIngredients}
            fridgeQuickPicks={fridgeQuickPicks}
          />

          <MealTypeSelector selectedTypes={formState.mealTypeIds} onSelectedTypesChange={setMealTypeIds} />

          <FilterSection
            cuisine={formState.cuisine}
            prepTime={formState.mealPrepTime}
            cookingStyle={formState.cookingStyle}
            onCuisineChange={setCuisine}
            onPrepTimeChange={setMealPrepTime}
            onCookingStyleChange={setCookingStyle}
          />

          <div className="flex w-full min-w-0 max-w-full justify-center pt-0.5">
            <div
              className={cn(
                "flex w-full max-w-full min-w-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#F97316] via-[#F97316] to-[#FBBF77] px-3 py-2.5 text-white shadow-[0_10px_28px_-10px_rgba(249,115,22,0.4)] transition-all duration-200 sm:gap-2.5 sm:px-4 sm:py-3 md:py-3.5",
                isGenerateDisabled && "cursor-not-allowed opacity-90"
              )}
            >
              <button
                type="button"
                onClick={() => {
                  if (isLoading || !canStartGenerate) return
                  setExpandedRecipeId(null)
                  generate()
                }}
                disabled={!canStartGenerate || isLoading}
                aria-disabled={!canStartGenerate || isLoading}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2.5 text-left transition-all duration-200 sm:gap-3",
                  "enabled:hover:opacity-95",
                  "disabled:cursor-not-allowed disabled:pointer-events-none"
                )}
              >
                <Sparkles
                  className="h-5 w-5 shrink-0 text-white drop-shadow sm:h-6 sm:w-6"
                  strokeWidth={2}
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-base font-bold leading-tight text-white sm:text-lg md:text-xl">
                    {isLoading ? "Generating..." : "Generate Recipes"}
                  </p>
                  <p className="text-[10px] font-medium text-white/95 sm:text-xs">
                    {isLoading ? "Tap stop to cancel" : generateHint}
                  </p>
                </div>
              </button>
              {isLoading ? (
                <button
                  type="button"
                  onClick={cancelGenerate}
                  aria-label="Stop generating recipes"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#F97316] shadow-[0_3px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)] sm:h-10 sm:w-10"
                >
                  <Square className="h-4 w-4 fill-current sm:h-[1.15rem] sm:w-[1.15rem]" strokeWidth={0} aria-hidden />
                </button>
              ) : (
                <span
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#F97316] shadow-[0_3px_12px_rgba(0,0,0,0.1)] sm:h-10 sm:w-10"
                  aria-hidden
                >
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                </span>
              )}
            </div>
          </div>
        </div>

        {showRecipes && recipes.length > 0 && (
          <RecipesSection
            recipes={recipes}
            expandedRecipeId={expandedRecipeId}
            onToggleExpand={handleToggleExpand}
            isMobile={isMobile}
            containerClassName="mx-auto mt-3 w-full min-w-0 max-w-full rounded-xl border border-[#E2D9CC] bg-white p-3 shadow-sm sm:mt-4 sm:p-4"
          />
        )}
      </main>

      <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}
