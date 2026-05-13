"use client"

import { useEffect, useState } from "react"
import { Menu, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { IngredientInput } from "@/components/ingredient-input"
import { FilterSection } from "@/components/filter-section"
import { MealTypeSelector } from "@/components/meal-type-selector"
import { RecipeCard, RecipePreviewCard } from "@/components/recipe-card"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/components/ui/use-mobile"
import { DecorativeLeaves } from "@/features/recipe-generator/components/decorative-leaves"
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

  // Mobile recipe detail view
  if (isMobile && showRecipeDetail && expandedRecipeId) {
    const expandedRecipe = recipes.find((r) => r.id === expandedRecipeId)
    if (expandedRecipe) {
      return (
        <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#F7F3EB] pb-24">
          <header
            className="sticky top-0 z-40 grid h-14 grid-cols-[1fr_auto_1fr] items-center px-4 text-white"
            style={{ background: "linear-gradient(to right, #3A4F16, #5C7A25)" }}
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
    <div className="relative min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#F7F3EB] pb-24">
      <DecorativeLeaves />
      <Header />

      <main className="mx-auto w-full min-w-0 max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8 lg:px-12 xl:px-16">
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-2xl md:text-[26px]">
            {"What's in your Fridge today?"}
          </h2>
          <div className="mt-3 flex items-center justify-center gap-1">
            <span className="h-0.5 w-12 bg-[#F97316] sm:w-16" />
            <span className="h-0.5 w-4 bg-[#F97316]/50 sm:w-5" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mx-1.5 text-[#4F6B1F]">
              <path
                d="M12 4C10 7 8 9 7 12C6 15 7 19 12 22C17 19 18 15 17 12C16 9 14 7 12 4Z"
                fill="currentColor"
              />
              <path d="M9 8C8 9 7.5 10 8 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <path d="M15 8C16 9 16.5 10 16 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span className="h-0.5 w-4 bg-[#F97316]/50 sm:w-5" />
            <span className="h-0.5 w-12 bg-[#F97316] sm:w-16" />
          </div>
        </div>

        <div className="mx-auto w-full min-w-0 max-w-[1080px] space-y-5">
          <IngredientInput
            ingredients={formState.ingredients}
            onIngredientsChange={setIngredients}
            fridgeQuickPicks={fridgeQuickPicks}
          />

          <FilterSection
            cuisine={formState.cuisine}
            prepTime={formState.mealPrepTime}
            cookingStyle={formState.cookingStyle}
            onCuisineChange={setCuisine}
            onPrepTimeChange={setMealPrepTime}
            onCookingStyleChange={setCookingStyle}
          />

          <MealTypeSelector selectedTypes={formState.mealTypeIds} onSelectedTypesChange={setMealTypeIds} />

          <div className="flex w-full min-w-0 max-w-full justify-center pt-2">
            <Button
              onClick={() => {
                setExpandedRecipeId(null)
                setShowRecipeDetail(false)
                generate()
              }}
              disabled={!canGenerate}
              className="h-11 w-full max-w-full min-w-0 rounded-md bg-[#F97316] text-base font-semibold text-white hover:bg-[#F28C38] disabled:pointer-events-none disabled:opacity-50 sm:w-[360px] sm:max-w-[360px] sm:text-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isLoading ? "Generating..." : "Generate Recipes"}
            </Button>
          </div>
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

