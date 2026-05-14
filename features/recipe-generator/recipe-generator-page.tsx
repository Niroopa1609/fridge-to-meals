"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Menu, SlidersHorizontal, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { IngredientInput } from "@/components/ingredient-input"
import { FilterSection } from "@/components/filter-section"
import { MealTypeSelector } from "@/components/meal-type-selector"
import { RecipeCard, RecipePreviewCard } from "@/components/recipe-card"
import { MobileNav } from "@/components/mobile-nav"
import { useIsMobile } from "@/components/ui/use-mobile"
import { RecipeHeroBanner } from "@/features/recipe-generator/components/recipe-hero-banner"
import { RecipesSection } from "@/features/recipe-generator/components/recipes-section"
import { useRecipeGenerator } from "@/features/recipe-generator/hooks/use-recipe-generator"
import { useAuth } from "@/features/auth/context/auth-context"
import { fetchFridgeItems } from "@/features/fridge/services/fridge"

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
    canGenerate,
    generate,
  } = useRecipeGenerator()

  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("planner")
  const [showRecipeDetail, setShowRecipeDetail] = useState(false)
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
  }

  const handleToggleExpand = (recipeId: string) => {
    if (isMobile) {
      setShowRecipeDetail(true)
      setExpandedRecipeId(recipeId)
    } else {
      setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId)
    }
  }

  const handleBackToRecipes = () => {
    setShowRecipeDetail(false)
    setExpandedRecipeId(null)
  }

  if (isMobile && showRecipeDetail && expandedRecipeId) {
    const expandedRecipe = recipes.find((r) => r.id === expandedRecipeId)
    if (expandedRecipe) {
      return (
        <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#FAF7F0] pb-28">
          <header
            className="sticky top-0 z-40 grid h-14 grid-cols-[1fr_auto_1fr] items-center px-4 text-white"
            style={{ background: "linear-gradient(to right, #2F4A16, #3d5c1f)" }}
          >
            <div className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 6C18 10 15 12 13 16C11 20 12 26 20 32C28 26 29 20 27 16C25 12 22 10 20 6Z"
                  fill="#F97316"
                />
              </svg>
              <span className="font-serif text-lg font-normal italic">Fridge To Meals</span>
            </div>
            <button
              type="button"
              className="col-start-3 inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-md hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </header>
          <main className="w-full min-w-0 max-w-full p-4">
            <RecipeCard
              recipe={expandedRecipe}
              isExpanded={true}
              onToggleExpand={handleBackToRecipes}
              isMobile={true}
            />
            <div className="mt-6 space-y-3">
              {recipes
                .filter((r) => r.id !== expandedRecipeId)
                .map((recipe) => (
                  <RecipePreviewCard
                    key={recipe.id}
                    recipe={recipe}
                    onExpand={() => setExpandedRecipeId(recipe.id)}
                  />
                ))}
            </div>
          </main>
          <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      )
    }
  }

  return (
    <div className="relative min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#FAF7F0] pb-28">
      <Header variant="recipe" />

      <main className="mx-auto w-full min-w-0 max-w-[1200px] space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <RecipeHeroBanner />

        <IngredientInput
          ingredients={formState.ingredients}
          onIngredientsChange={setIngredients}
          fridgeQuickPicks={fridgeQuickPicks}
        />

        <div className="flex flex-col gap-6 sm:gap-8">
          <section className="order-1 w-full max-w-full min-w-0 space-y-3 md:order-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 shrink-0 text-[#4F6B1F]" strokeWidth={2} aria-hidden />
              <h2 className="font-serif text-lg font-semibold text-[#2F4A16] sm:text-xl">Recipe Preferences</h2>
            </div>
            <div className="rounded-3xl border border-[#E8DFD0] bg-white p-4 shadow-[0_10px_36px_-14px_rgba(47,74,22,0.1)] sm:p-6">
              <FilterSection
                cuisine={formState.cuisine}
                prepTime={formState.mealPrepTime}
                cookingStyle={formState.cookingStyle}
                onCuisineChange={setCuisine}
                onPrepTimeChange={setMealPrepTime}
                onCookingStyleChange={setCookingStyle}
              />
            </div>
          </section>

          <div className="order-2 md:order-1">
            <MealTypeSelector selectedTypes={formState.mealTypeIds} onSelectedTypesChange={setMealTypeIds} />
          </div>
        </div>

        <div className="flex w-full min-w-0 max-w-full justify-center pt-1">
          <button
            type="button"
            onClick={() => {
              setExpandedRecipeId(null)
              setShowRecipeDetail(false)
              generate()
            }}
            disabled={!canGenerate}
            className="flex w-full max-w-full min-w-0 items-center gap-4 rounded-3xl bg-gradient-to-r from-[#F97316] via-[#F97316] to-[#FBBF77] px-5 py-4 text-left text-white shadow-[0_14px_40px_-10px_rgba(249,115,22,0.55)] transition hover:brightness-[1.03] disabled:pointer-events-none disabled:from-[#fdba8c] disabled:via-[#fdba8c] disabled:to-[#fde68a] disabled:opacity-80 sm:px-8 sm:py-5"
          >
            <Sparkles className="h-7 w-7 shrink-0 text-white drop-shadow-sm" strokeWidth={2} />
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-lg font-bold leading-tight sm:text-xl">
                {isLoading ? "Generating..." : "Generate Recipes"}
              </p>
              <p className="text-sm font-medium text-white/95">Let AI work its magic ✨</p>
            </div>
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-md">
              <ArrowRight className="h-6 w-6 text-[#F97316]" strokeWidth={2.5} />
            </span>
          </button>
        </div>

        {showRecipes && recipes.length > 0 && (
          <RecipesSection
            recipes={recipes}
            expandedRecipeId={expandedRecipeId}
            onToggleExpand={handleToggleExpand}
            isMobile={isMobile}
          />
        )}
      </main>

      <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}
