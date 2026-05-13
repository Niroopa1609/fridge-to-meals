"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Heart, Leaf, Minus, Search, Clock, Trash2, Users, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { RecipeDetailMobileView } from "@/components/recipe-detail-mobile-view"
import { DecorativeLeaves } from "@/features/recipe-generator/components/decorative-leaves"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useAuth } from "@/features/auth/context/auth-context"
import { deleteFavorite, fetchFavorites, type FavoriteDto } from "@/features/favorites/services/favorites"
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog"
import { RecipeShare } from "@/features/recipe-generator/components/recipe-share"
import { favoriteDtoToRecipe } from "@/features/favorites/utils/favorite-to-recipe"

type MealFilter =
  | "All"
  | "Soup"
  | "Salad"
  | "Appetizer"
  | "Breakfast"
  | "Lunch"
  | "Snack"
  | "Dinner"

function normalizeMealType(v: string | null | undefined): string {
  return (v ?? "").trim()
}

function asPlannerRecipe(recipeJson: any) {
  return recipeJson as any
}

function FavoriteSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-[#E2D9CC] bg-white shadow-sm">
          <div className="h-40 w-full animate-pulse bg-[#E4ECD4]/50" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#E2D9CC]/60" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#E2D9CC]/40" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-[#E2D9CC]/40" />
          </div>
        </div>
      ))}
    </div>
  )
}

function FavoriteCard({
  favorite,
  onOpen,
  onRemove,
}: {
  favorite: FavoriteDto
  onOpen: () => void
  onRemove: () => void
}) {
  const imageUrl = favorite.imageUrl || "/placeholder.svg"
  const mealType = normalizeMealType(favorite.mealType)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full overflow-hidden rounded-xl border border-[#E2D9CC] bg-white text-left shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-[#E4ECD4]/20 sm:h-48">
        <Image src={imageUrl} alt={favorite.title} fill className="object-cover transition duration-300 group-hover:scale-[1.02]" />
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 shadow-sm">
            <Heart className="h-5 w-5 fill-[#F97316] text-[#F97316]" />
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 shadow-sm hover:bg-white"
            aria-label="Remove from Favorites"
          >
            <Trash2 className="h-5 w-5 text-[#1F3A2B]/70" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate font-serif text-[16px] font-semibold text-[#1F3A2B]">
            {favorite.title}
          </h3>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#1F3A2B]/70">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {favorite.prepTime || "—"}
          </span>
          <span className="h-1 w-1 rounded-full bg-[#1F3A2B]/30" />
          <span className="font-semibold text-[#EA6A12]">{favorite.difficulty || "—"}</span>
          <span className="h-1 w-1 rounded-full bg-[#1F3A2B]/30" />
          <span className="rounded bg-[#E4ECD4] px-2 py-0.5 font-semibold uppercase text-[#4F6B1F]">{mealType}</span>
        </div>
        <p className="mt-2 line-clamp-1 text-xs text-[#1F3A2B]/65">
          {favorite.mainIngredients || ""}
        </p>
      </div>
    </button>
  )
}

function FavoriteRow({
  favorite,
  onOpen,
  onRemove,
}: {
  favorite: FavoriteDto
  onOpen: () => void
  onRemove: () => void
}) {
  const imageUrl = favorite.imageUrl || "/placeholder.svg"
  const mealType = normalizeMealType(favorite.mealType)
  const diffLabel = (favorite.difficulty ?? "—").toString().trim().toUpperCase()

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-start gap-3 rounded-xl border border-[#E2D9CC] bg-white p-3.5 text-left shadow-sm"
    >
      <div className="relative h-[88px] w-[112px] max-[480px]:w-[104px] shrink-0 overflow-hidden rounded-md bg-[#E4ECD4]/20">
        <Image src={imageUrl} alt={favorite.title} fill className="object-cover" sizes="120px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col text-left">
        <h3 className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-[#1F3A2B]">
          {favorite.title}
        </h3>
        <div className="mt-1.5 flex min-w-0 items-center text-xs">
          <span className="flex shrink-0 items-center gap-1 text-[#1F3A2B]/70">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="min-w-0">{favorite.prepTime || "—"}</span>
          </span>
          <span className="mx-2 h-3 w-px shrink-0 bg-[#1F3A2B]/25" aria-hidden />
          <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#EA6A12]">{diffLabel}</span>
          <span className="min-w-0 flex-1" aria-hidden />
        </div>
        <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
          <span className="inline-flex min-w-0 shrink rounded-full bg-[#E4ECD4] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#4F6B1F]">
            {mealType.toUpperCase()}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className="pointer-events-none inline-flex h-8 w-8 items-center justify-center"
              aria-hidden
            >
              <Heart className="h-5 w-5 fill-[#F97316] text-[#F97316]" />
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E2D9CC] bg-white hover:bg-[#F7F3EB]"
              aria-label="Remove from Favorites"
            >
              <Trash2 className="h-4 w-4 text-[#1F3A2B]/70" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </button>
  )
}

function FavoritePreviewRow({
  favorite,
  onOpen,
  onRemove,
}: {
  favorite: FavoriteDto
  onOpen: () => void
  onRemove: () => void
}) {
  const imageUrl = favorite.imageUrl || "/placeholder.svg"
  const mealType = normalizeMealType(favorite.mealType)
  const diffLabel = (favorite.difficulty ?? "—").toString().trim().toUpperCase()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen()
        }
      }}
      className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-[#E2D9CC] bg-white p-3.5 text-left shadow-sm outline-none hover:bg-[#FAF8F5] focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-[#E4ECD4]/20">
        <Image src={imageUrl} alt={favorite.title} fill className="object-cover" sizes="96px" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <h3 className="line-clamp-2 font-serif text-sm font-semibold leading-snug text-[#1F3A2B]">
          {favorite.title}
        </h3>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#1F3A2B]/70">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" aria-hidden />
            {favorite.prepTime || "—"}
          </span>
          <span className="h-2.5 w-px shrink-0 bg-[#1F3A2B]/25" aria-hidden />
          <span className="shrink-0 font-bold uppercase tracking-wide text-[#EA6A12]">{diffLabel}</span>
        </div>
        <span className="mt-1 inline-flex rounded-full bg-[#E4ECD4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#4F6B1F]">
          {mealType.toUpperCase()}
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center gap-1.5 self-stretch py-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E2D9CC] bg-white hover:bg-[#F7F3EB]"
          aria-label="Remove from Favorites"
        >
          <Trash2 className="h-4 w-4 text-[#1F3A2B]/70" strokeWidth={2} />
        </button>
        <span className="inline-flex h-8 w-8 items-center justify-center text-[#4F6B1F]" aria-hidden>
          <ChevronDown className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

const difficultyStyles = {
  EASY: "bg-[#FDE9DD] text-[#EA6A12]",
  MEDIUM: "bg-[#FDE9DD] text-[#EA6A12]",
  HARD: "bg-[#FDE9DD] text-[#EA6A12]",
} as const

type DifficultyKey = keyof typeof difficultyStyles

function normalizeDifficultyKey(d: unknown): DifficultyKey {
  const s = String(d ?? "").toUpperCase()
  if (s.includes("HARD")) return "HARD"
  if (s.includes("MEDIUM")) return "MEDIUM"
  return "EASY"
}

function DetailContent({
  favorite,
  showHeaderClose = false,
}: {
  favorite: FavoriteDto
  showHeaderClose?: boolean
}) {
  const recipe = asPlannerRecipe(favorite.recipeJson)

  const title = recipe?.title ?? favorite.title
  const image = recipe?.image ?? favorite.imageUrl ?? "/placeholder.svg"
  const prepTime = recipe?.time ?? favorite.prepTime ?? "—"
  const difficultyKey = normalizeDifficultyKey(recipe?.difficulty ?? favorite.difficulty)
  const difficultyLabel = String(recipe?.difficulty ?? favorite.difficulty ?? "—").toUpperCase()
  const mealType = recipe?.mealType ?? favorite.mealType
  const description = recipe?.description ?? ""
  const ingredients: string[] = Array.isArray(recipe?.ingredients) ? recipe.ingredients : []
  const instructions: string[] = Array.isArray(recipe?.instructions) ? recipe.instructions : []
  const proTips: string[] = Array.isArray(recipe?.proTips) ? recipe.proTips : []
  const nutrition = recipe?.nutrition
  const servings = typeof recipe?.servings === "number" ? recipe.servings : null
  const isVegetarian = Boolean(recipe?.isVegetarian)

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#E2D9CC] bg-white shadow-sm">
      {/* Top row: image + details — items-start avoids empty space below share buttons */}
      <div className="flex items-start">
        <div className="relative aspect-[4/3] w-[280px] shrink-0 overflow-hidden bg-[#E4ECD4]/20 lg:w-[320px]">
          <Image src={image} alt={title} fill className="object-cover" sizes="(min-width: 1024px) 320px, 280px" />
          <span className="pointer-events-none absolute right-3 top-3 inline-flex rounded-lg bg-white p-2 shadow-md">
            <Heart className="h-5 w-5 fill-none stroke-[#4F6B1F] stroke-2 text-[#4F6B1F]" aria-hidden />
          </span>
        </div>
        <div className="relative min-w-0 flex-1 px-4 py-3 pr-14 sm:px-5 sm:py-3.5 sm:pr-14">
          {showHeaderClose ? (
            <DialogClose
              type="button"
              className="absolute right-3 top-3 inline-flex rounded-full bg-[#F97316] p-2 text-white shadow-sm ring-offset-2 transition hover:bg-[#F28C38] focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:outline-none"
              aria-label="Close"
            >
              <Minus className="h-4 w-4" />
            </DialogClose>
          ) : null}
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-[#E4ECD4] px-2.5 py-1 text-xs font-semibold uppercase text-[#4F6B1F]">
                {String(mealType).toUpperCase()}
              </span>
              <span className={cn("rounded px-2.5 py-1 text-xs font-semibold", difficultyStyles[difficultyKey])}>
                {difficultyLabel}
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold leading-snug text-[#1F3A2B]">{title}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#1F3A2B]/70">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                {prepTime}
              </span>
              {servings != null ? (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 shrink-0" />
                  {servings} servings
                </span>
              ) : null}
              {isVegetarian ? (
                <span className="flex items-center gap-1.5 text-[#4F6B1F]">
                  <Leaf className="h-4 w-4 shrink-0" />
                  Vegetarian
                </span>
              ) : null}
            </div>
            <div className="flex gap-2 pt-0.5">
              <RecipeShare recipe={recipe} showSms={false} />
            </div>
            {description ? (
              <p className="text-sm leading-relaxed text-[#1F3A2B]/70 pt-0.5">{description}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E2D9CC] p-5">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-[#1F3A2B]">
                <span className="text-[#F97316]">📦</span> Ingredients
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {ingredients.map((ingredient, index) => (
                  <p key={index} className="text-sm text-[#1F3A2B]/70">
                    <span className="mr-2 text-[#F97316]">•</span>
                    {ingredient}
                  </p>
                ))}
              </div>
            </div>

            {proTips.length > 0 ? (
              <div className="rounded-xl bg-[#E4ECD4] p-4">
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-[#1F3A2B]">
                  <span>🥄</span> Pro Tips
                </h4>
                <ul className="space-y-1">
                  {proTips.map((tip, index) => (
                    <li key={index} className="text-sm text-[#4F6B1F]">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-[#1F3A2B]">
              <span className="text-[#F97316]">🔥</span> Instructions
            </h4>
            <div className="space-y-2.5">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-[#1F3A2B]/70">{instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {nutrition ? (
          <div className="mt-6 border-t border-[#E2D9CC] pt-5">
            <div className="grid grid-cols-4 gap-4 rounded-xl bg-[#F7F3EB] p-4 text-center">
              <div>
                <p className="text-xl font-bold text-[#1F3A2B]">{nutrition.calories}</p>
                <p className="text-sm text-[#1F3A2B]/70">Calories</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#1F3A2B]">{nutrition.protein}</p>
                <p className="text-sm text-[#1F3A2B]/70">Protein</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#1F3A2B]">{nutrition.carbs}</p>
                <p className="text-sm text-[#1F3A2B]/70">Carbs</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#1F3A2B]">{nutrition.fat}</p>
                <p className="text-sm text-[#1F3A2B]/70">Fat</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function FavoritesPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { accessToken, user, isHydrated } = useAuth()

  useEffect(() => {
    if (!isHydrated) return
    if (user && accessToken) return
    window.dispatchEvent(new Event("auth:signin"))
    router.replace("/")
  }, [accessToken, isHydrated, router, user])

  const [favorites, setFavorites] = useState<FavoriteDto[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [mealFilter, setMealFilter] = useState<MealFilter>("All")

  const [selected, setSelected] = useState<FavoriteDto | null>(null)
  const [expandedMobileId, setExpandedMobileId] = useState<string | null>(null)

  useEffect(() => {
    if (!isHydrated) return
    if (!user || !accessToken) {
      setFavorites([])
      return
    }

    let cancelled = false
    setLoadError(null)
    setFavorites(null)
    fetchFavorites(accessToken)
      .then((data) => {
        if (cancelled) return
        setFavorites(data)
      })
      .catch(() => {
        if (cancelled) return
        setLoadError("Could not load favorites. Please try again.")
        setFavorites([])
      })
    return () => {
      cancelled = true
    }
  }, [accessToken, isHydrated, user])

  const filtered = useMemo(() => {
    const list = favorites ?? []
    const q = query.trim().toLowerCase()
    const byMeal = (f: FavoriteDto) => {
      if (mealFilter === "All") return true
      const mt = normalizeMealType(f.mealType).toLowerCase()
      const ft = mealFilter.toLowerCase()
      if (ft === "appetizer" && (mt === "appetizer" || mt === "starter")) return true
      return mt === ft
    }
    const byQuery = (f: FavoriteDto) => {
      if (!q) return true
      const hay = `${f.title} ${f.mainIngredients ?? ""}`.toLowerCase()
      return hay.includes(q)
    }
    return list.filter((f) => byMeal(f) && byQuery(f))
  }, [favorites, mealFilter, query])

  useEffect(() => {
    if (!expandedMobileId) return
    if (!filtered.some((f) => f.id === expandedMobileId)) {
      setExpandedMobileId(null)
    }
  }, [filtered, expandedMobileId])

  const mealFilters: MealFilter[] = [
    "All",
    "Soup",
    "Salad",
    "Appetizer",
    "Breakfast",
    "Lunch",
    "Snack",
    "Dinner",
  ]

  const countLabel = `${filtered.length} recipe${filtered.length === 1 ? "" : "s"}`

  const handleRemove = async (fav: FavoriteDto) => {
    if (!accessToken) {
      toast("Please sign in to manage favorites")
      window.dispatchEvent(new Event("auth:signin"))
      return
    }
    try {
      await deleteFavorite(fav.id, accessToken)
      setFavorites((prev) => (prev ?? []).filter((x) => x.id !== fav.id))
      setSelected((prev) => (prev?.id === fav.id ? null : prev))
      setExpandedMobileId((prev) => (prev === fav.id ? null : prev))
      toast.success("Removed from Favorites")
    } catch {
      toast.error("Could not remove favorite. Please try again.")
    }
  }

  const open = Boolean(selected) && !isMobile

  return (
    <div className="relative min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#F7F3EB] pb-24">
      <DecorativeLeaves />
      <Header />

      <main className="mx-auto w-full min-w-0 max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8 lg:px-12 xl:px-16">
        <div className="mx-auto w-full min-w-0 max-w-[1100px]">
          <>
          <div className="mb-6 space-y-2 text-center">
            <h1 className="font-serif text-2xl font-semibold text-[#1F3A2B] sm:text-3xl">Favorites</h1>
            <p className="text-sm text-[#1F3A2B]/70">All your favorite recipes in one place.</p>
            <div className="flex items-center justify-center gap-2 pt-1 text-sm text-[#1F3A2B]/70">
              <Heart className="h-4 w-4 fill-[#F97316]/20 text-[#F97316]" />
              <span className="font-medium">{favorites ? `${favorites.length} recipes` : "—"}</span>
            </div>
          </div>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative w-full shrink-0 sm:max-w-[360px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1F3A2B]/40" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your favorites..."
                className="h-10 border-[#E2D9CC] bg-white pl-9 text-sm"
              />
            </div>

            <div className="min-w-0 flex-1 rounded-xl border border-[#E2D9CC] bg-white px-1 py-0.5 sm:px-1.5 sm:py-1">
              <div className="grid w-full min-w-0 grid-cols-4 gap-x-1.5 gap-y-1 sm:grid-cols-8 sm:gap-x-2 sm:gap-y-0">
                {mealFilters.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setMealFilter(f)}
                    className={cn(
                      "min-w-0 rounded-md px-1 py-1 text-center text-[10px] font-semibold leading-none transition sm:rounded-lg sm:px-1.5 sm:py-1 sm:text-xs",
                      mealFilter === f ? "bg-[#FDE9DD] text-[#EA6A12]" : "text-[#1F3A2B]/70 hover:text-[#1F3A2B]"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loadError ? (
            <div className="rounded-xl border border-[#E2D9CC] bg-white p-4 text-sm text-[#1F3A2B]/70">
              {loadError}
            </div>
          ) : null}

          {!isHydrated || favorites === null ? (
            <FavoriteSkeletonGrid />
          ) : favorites.length === 0 ? (
            <div className="rounded-2xl border border-[#E2D9CC] bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-[#1F3A2B]/70">
                No favorites yet. Save recipes from Planner to see them here.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-[#E2D9CC] bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-[#1F3A2B]/70">No matches.</p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-end text-xs text-[#1F3A2B]/60">
                {countLabel}
              </div>
              {isMobile ? (
                <div className="space-y-4">
                  {filtered.map((f) => {
                    if (expandedMobileId === f.id) {
                      return (
                        <div key={f.id} className="w-full min-w-0 max-w-full">
                          <RecipeDetailMobileView
                            recipe={favoriteDtoToRecipe(f)}
                            onBack={() => setExpandedMobileId(null)}
                            heartFilled
                            onHeartClick={() => void handleRemove(f)}
                            heartAriaLabel="Remove from favorites"
                            showBackLink={false}
                            collapseOnImage
                            heartOnImageBottomRight
                          />
                        </div>
                      )
                    }
                    if (expandedMobileId && expandedMobileId !== f.id) {
                      return (
                        <FavoritePreviewRow
                          key={f.id}
                          favorite={f}
                          onOpen={() => setExpandedMobileId(f.id)}
                          onRemove={() => void handleRemove(f)}
                        />
                      )
                    }
                    return (
                      <FavoriteRow
                        key={f.id}
                        favorite={f}
                        onOpen={() => setExpandedMobileId(f.id)}
                        onRemove={() => void handleRemove(f)}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((f) => (
                    <FavoriteCard
                      key={f.id}
                      favorite={f}
                      onOpen={() => setSelected(f)}
                      onRemove={() => void handleRemove(f)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          </>
        </div>
      </main>

      {!isMobile ? (
        <Dialog open={open} onOpenChange={(v) => !v && setSelected(null)}>
          <DialogContent
            className="w-[95vw] max-w-[95vw] gap-0 border-[#E2D9CC] bg-white p-0 sm:w-[76vw] sm:max-w-[min(1200px,80vw)] max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-xl shadow-sm"
            showCloseButton={false}
          >
            {selected ? (
              <div className="p-0">
                <DetailContent favorite={selected} showHeaderClose />
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      ) : null}

      <MobileNav
        activeTab="favorites"
        onTabChange={(tab) => {
          if (tab === "today") router.push("/todays-picks")
          if (tab === "planner") router.push("/")
          if (tab === "fridge") router.push("/my-fridge")
          if (tab === "favorites") router.push("/favorites")
        }}
      />
    </div>
  )
}

