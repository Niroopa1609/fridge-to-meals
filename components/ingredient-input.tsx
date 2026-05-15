"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Mic, Plus, Refrigerator, Search, X } from "lucide-react"
import { useIngredientVoiceInput } from "@/hooks/use-ingredient-voice-input"
import { useAuth } from "@/features/auth/context/auth-context"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface IngredientInputProps {
  ingredients: string[]
  onIngredientsChange: (ingredients: string[]) => void
  fridgeQuickPicks?: string[]
}

/** Colorful quick chips (reference layout) */
const QUICK_CHIPS: { emoji: string; value: string }[] = [
  { emoji: "🥚", value: "Eggs" },
  { emoji: "🍗", value: "Chicken" },
  { emoji: "🐟", value: "Fish" },
  { emoji: "🫘", value: "Tofu" },
  { emoji: "🦐", value: "Shrimp" },
  { emoji: "🍚", value: "Rice" },
  { emoji: "🌾", value: "Oats" },
  { emoji: "🍞", value: "Bread" },
  { emoji: "🍝", value: "Pasta" },
  { emoji: "🍜", value: "Noodles" },
  { emoji: "🫑", value: "Capsicum" },
  { emoji: "🌽", value: "Corn" },
  { emoji: "🥬", value: "Spinach" },
  { emoji: "🍄", value: "Mushroom" },
]

function normalizeIngredientKey(value: string): string {
  return value.trim().toLowerCase()
}

const SUGGESTED_INGREDIENTS = [
  "Chicken",
  "Eggs",
  "Paneer",
  "Rice",
  "Spinach",
  "Broccoli",
  "Onion",
  "Tomato",
  "Pasta",
  "Noodles",
  "Beans",
  "Carrot",
  "Potato",
  "Milk",
  "Yogurt",
  "Cheese",
  "Lentils",
  "Chickpeas",
  "Tofu",
  "Shrimp",
  "Mushroom",
  "Bell Pepper",
]

export function IngredientInput({
  ingredients,
  onIngredientsChange,
  fridgeQuickPicks,
}: IngredientInputProps) {
  const { user, isHydrated } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const chipsScrollRef = useRef<HTMLDivElement>(null)
  const chipsDragRef = useRef({ active: false, moved: false, startX: 0, startScroll: 0 })
  const [inputValue, setInputValue] = useState("")
  const [chipsCanScroll, setChipsCanScroll] = useState(false)
  const [isSuggestOpen, setIsSuggestOpen] = useState(false)
  const [fridgeDialogOpen, setFridgeDialogOpen] = useState(false)
  const [fridgeModalSelected, setFridgeModalSelected] = useState<Set<string>>(new Set())

  const fridgeItemsDeduped = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const raw of fridgeQuickPicks ?? []) {
      const s = raw.trim()
      if (!s) continue
      const k = normalizeIngredientKey(s)
      if (seen.has(k)) continue
      seen.add(k)
      out.push(s)
    }
    return out
  }, [fridgeQuickPicks])

  const addIngredients = useCallback(
    (values: string[]) => {
      const existing = new Set(ingredients.map(normalizeIngredientKey))
      const next = [...ingredients]

      for (const raw of values) {
        const trimmed = raw.trim()
        if (!trimmed) continue
        const key = normalizeIngredientKey(trimmed)
        if (existing.has(key)) continue
        existing.add(key)
        next.push(trimmed)
      }

      if (next.length !== ingredients.length) {
        onIngredientsChange(next)
      }
    },
    [ingredients, onIngredientsChange]
  )

  const { handleMicClick, voiceUi } = useIngredientVoiceInput({
    onVoiceTags: addIngredients,
  })

  const handleRemove = (ingredient: string) => {
    const key = normalizeIngredientKey(ingredient)
    onIngredientsChange(ingredients.filter((i) => normalizeIngredientKey(i) !== key))
  }

  const handleAddFromInput = () => {
    const raw = inputValue
    const parts = raw
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length === 0) {
      setIsSuggestOpen(false)
      return
    }
    addIngredients(parts)
    setInputValue("")
    setIsSuggestOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddFromInput()
    }
  }

  const toggleFridgeModalChip = (item: string) => {
    setFridgeModalSelected((prev) => {
      const next = new Set(prev)
      const key = normalizeIngredientKey(item)
      const hit = [...next].find((x) => normalizeIngredientKey(x) === key)
      if (hit !== undefined) next.delete(hit)
      else next.add(item)
      return next
    })
  }

  const handleFridgeDialogOpenChange = (open: boolean) => {
    setFridgeDialogOpen(open)
    if (open) setFridgeModalSelected(new Set())
  }

  const handleFridgeAddButtonClick = () => {
    if (!isHydrated) return
    if (!user) {
      window.dispatchEvent(
        new CustomEvent("auth:signin", {
          detail: { message: "Sign in to use ingredients from your fridge." },
        })
      )
      return
    }
    handleFridgeDialogOpenChange(true)
  }

  const handleAddSelectedFromFridge = () => {
    addIngredients([...fridgeModalSelected])
    setFridgeDialogOpen(false)
    setFridgeModalSelected(new Set())
  }

  const filteredSuggestions =
    inputValue.trim().length === 0
      ? []
      : SUGGESTED_INGREDIENTS.filter((s) => {
          const q = inputValue.trim().toLowerCase()
          const alreadySelected = ingredients.some((i) => normalizeIngredientKey(i) === normalizeIngredientKey(s))
          return s.toLowerCase().includes(q) && !alreadySelected
        }).slice(0, 8)

  const updateChipsCanScroll = useCallback(() => {
    const el = chipsScrollRef.current
    if (!el) return
    setChipsCanScroll(el.scrollWidth > el.clientWidth + 2)
  }, [])

  useEffect(() => {
    const el = chipsScrollRef.current
    if (!el) return

    const measure = () => {
      updateChipsCanScroll()
    }
    measure()
    const raf = requestAnimationFrame(measure)

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    const inner = el.firstElementChild
    if (inner) ro.observe(inner)

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 1) return
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (delta === 0) return
      e.preventDefault()
      e.stopPropagation()
      el.scrollLeft += delta
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      chipsDragRef.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        startScroll: el.scrollLeft,
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!chipsDragRef.current.active) return
      const dx = e.clientX - chipsDragRef.current.startX
      if (Math.abs(dx) > 4) {
        chipsDragRef.current.moved = true
        el.scrollLeft = chipsDragRef.current.startScroll - dx
      }
    }

    const endPointer = () => {
      chipsDragRef.current.active = false
    }

    el.addEventListener("wheel", onWheel, { passive: false, capture: true })
    el.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("pointermove", onPointerMove)
    document.addEventListener("pointerup", endPointer)
    document.addEventListener("pointercancel", endPointer)
    el.addEventListener("scroll", measure)
    window.addEventListener("resize", measure)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener("wheel", onWheel, { capture: true })
      el.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerup", endPointer)
      document.removeEventListener("pointercancel", endPointer)
      el.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
    }
  }, [updateChipsCanScroll])

  const handleQuickChipClick = (value: string) => {
    if (chipsDragRef.current.moved) {
      chipsDragRef.current.moved = false
      return
    }
    addIngredients([value])
    setInputValue("")
    setIsSuggestOpen(false)
  }

  return (
    <section className="w-full max-w-full min-w-0 border-b border-[#E6E0D4]/40 pb-3 sm:pb-4">
      <div className="mb-2 flex flex-wrap items-start gap-2 sm:mb-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <span className="inline-flex shrink-0 text-[#3D7C47]" aria-hidden>
            <Refrigerator className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
          </span>
          <div className="min-w-0 space-y-0">
            <h2 className="font-serif text-sm font-semibold text-[#1F3A2B] sm:text-base md:text-lg">
              What&apos;s in your Fridge? <span className="text-[#F97316]">*</span>
            </h2>
            <p className="text-[11px] text-[#1F3A2B]/65 sm:text-xs">Add ingredients you have at home</p>
          </div>
        </div>
      </div>

      <div className="mb-2 w-full min-w-0 sm:mb-2.5">
        <div
          ref={chipsScrollRef}
          className={cn(
            "w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden",
            chipsCanScroll && "cursor-grab select-none active:cursor-grabbing"
          )}
        >
        <div className="inline-flex w-max flex-nowrap items-center gap-2 pr-1">
          {QUICK_CHIPS.map(({ emoji, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleQuickChipClick(value)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E4DDCF] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#1F3A2B] shadow-[0_2px_8px_-2px_rgba(47,74,22,0.08)] transition-all duration-200 hover:scale-[1.02] hover:border-[#F97316]/35 hover:shadow-[0_4px_12px_-2px_rgba(249,115,22,0.15)] sm:px-3 sm:text-xs"
            >
              <span className="text-sm leading-none sm:text-base" aria-hidden>
                {emoji}
              </span>
              {value}
            </button>
          ))}
        </div>
        </div>
      </div>

      <div className="flex w-full max-w-full min-w-0 flex-nowrap items-stretch gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-[#1F3A2B]/35 sm:left-3.5 sm:h-[1.05rem] sm:w-[1.05rem]" />

          <div
            className="relative flex min-h-[2.625rem] w-full min-w-0 max-w-full flex-wrap items-center gap-1 rounded-xl border border-[#E6E0D4]/90 bg-white py-1.5 pl-10 pr-11 text-sm text-[#1F3A2B] shadow-[0_2px_10px_-4px_rgba(47,74,22,0.08)] transition-all duration-200 focus-within:border-[#F97316]/55 focus-within:shadow-[0_4px_14px_-4px_rgba(249,115,22,0.18)] focus-within:ring-2 focus-within:ring-[#F97316]/12 sm:min-h-[2.75rem] sm:gap-1.5 sm:py-2 sm:pl-11 sm:pr-12"
            onMouseDown={() => setIsSuggestOpen(true)}
          >
            {ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="inline-flex max-w-full min-w-0 shrink items-center gap-1 rounded-full border border-[#D7E4BE] bg-[#E8F4DC] px-2.5 py-0.5 text-xs font-semibold text-[#2F4A16] sm:py-1"
              >
                <span className="min-w-0 truncate">{ingredient}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(ingredient)}
                  className="ml-0.5 shrink-0 rounded-full p-0.5 hover:bg-[#D7E4BE]"
                  aria-label={`Remove ${ingredient}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            <input
              ref={inputRef}
              type="text"
              placeholder="Add or search ingredients..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setIsSuggestOpen(true)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSuggestOpen(true)}
              onBlur={() => setTimeout(() => setIsSuggestOpen(false), 150)}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#1F3A2B] placeholder:text-[#1F3A2B]/40 outline-none"
            />

            <button
              type="button"
              onClick={handleMicClick}
              disabled={voiceUi.isMicBusy}
              aria-label={
                voiceUi.phase === "web_listening" || voiceUi.phase === "media_recording"
                  ? "Stop voice input"
                  : "Voice input"
              }
              aria-pressed={voiceUi.phase === "web_listening" || voiceUi.phase === "media_recording"}
              className={`absolute right-1.5 top-1/2 z-[2] inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border-2 border-transparent text-[#1F3A2B]/45 transition-all duration-200 hover:bg-[#FAF7F0] hover:text-[#1F3A2B] disabled:pointer-events-none disabled:opacity-50 ${
                voiceUi.phase === "web_listening" || voiceUi.phase === "media_recording"
                  ? "border-[#F97316] text-[#F97316] ring-2 ring-[#F97316]/25"
                  : ""
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>

          {isSuggestOpen && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-w-full overflow-hidden rounded-xl border border-[#E6E0D4]/90 bg-white shadow-[0_8px_24px_-8px_rgba(47,74,22,0.12)]">
              {filteredSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    addIngredients([s])
                    setInputValue("")
                    setIsSuggestOpen(false)
                  }}
                  className="flex w-full min-w-0 max-w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-[#1F3A2B] hover:bg-[#FAF7F0] sm:px-4"
                >
                  <span className="min-w-0 truncate">{s}</span>
                  <span className="shrink-0 text-xs font-semibold text-[#4F6B1F]/70">Add</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 self-center">
          <button
            type="button"
            onClick={handleAddFromInput}
            disabled={!inputValue.trim()}
            aria-label="Add typed ingredients"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#F97316]/35 bg-white text-[#F97316] shadow-[0_1px_4px_-1px_rgba(249,115,22,0.2)] transition-all duration-200 hover:border-[#F97316]/55 hover:bg-[#FFF7ED] disabled:pointer-events-none disabled:opacity-40 sm:h-8 sm:w-8"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            onClick={handleFridgeAddButtonClick}
            aria-label="Add from your fridge"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-[0_3px_12px_-3px_rgba(47,74,22,0.18)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_5px_16px_-3px_rgba(47,74,22,0.22)] sm:h-11 sm:w-11"
          >
            <Image
              src="/recipe-generator/fridge-icon.png"
              alt=""
              width={44}
              height={44}
              className="h-full w-full rounded-2xl object-cover"
            />
          </button>
        </div>
      </div>

      <Dialog open={fridgeDialogOpen} onOpenChange={handleFridgeDialogOpenChange}>
        <DialogContent
          showCloseButton
          className="flex max-h-[90dvh] w-[min(100%,22rem)] max-w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden border-[#E2D9CC] bg-[#FDFCF8] p-0 sm:max-w-md"
        >
          <DialogHeader className="shrink-0 border-b border-[#E2D9CC] px-4 py-3 text-left sm:px-5 sm:py-4">
            <DialogTitle className="font-serif text-base font-semibold text-[#1F3A2B] sm:text-lg">
              Choose from your fridge
            </DialogTitle>
          </DialogHeader>

          <div className="min-w-0 max-h-[min(52dvh,15.5rem)] overflow-y-auto overflow-x-hidden px-4 py-3 sm:max-h-[min(45vh,17rem)] sm:px-5 sm:py-4">
            {fridgeItemsDeduped.length === 0 ? (
              <p className="text-sm text-[#1F3A2B]/65">No items in your fridge yet. Add items from My Fridge.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {fridgeItemsDeduped.map((item) => {
                  const selected = [...fridgeModalSelected].some(
                    (x) => normalizeIngredientKey(x) === normalizeIngredientKey(item)
                  )
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleFridgeModalChip(item)}
                      className={
                        selected
                          ? "rounded-full border-2 border-[#F97316] bg-[#FDE9DD] px-3 py-1.5 text-xs font-semibold text-[#EA6A12] shadow-sm"
                          : "rounded-full border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs font-semibold text-[#4F6B1F] hover:border-[#F97316]/50"
                      }
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-[#E2D9CC] bg-[#F7F3EB]/80 px-4 py-3 sm:flex-row sm:justify-end sm:px-5 sm:py-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#E2D9CC] bg-white text-[#1F3A2B] hover:bg-[#F7F3EB] sm:w-auto"
              onClick={() => handleFridgeDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full bg-[#F97316] text-white hover:bg-[#F28C38] sm:w-auto"
              disabled={fridgeModalSelected.size === 0 || fridgeItemsDeduped.length === 0}
              onClick={handleAddSelectedFromFridge}
            >
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {(voiceUi.statusMessage || voiceUi.errorMessage) && (
        <p
          role="status"
          className={`mt-2 text-sm ${voiceUi.errorMessage ? "text-red-700" : "text-[#1F3A2B]/70"}`}
        >
          {voiceUi.errorMessage ?? voiceUi.statusMessage}
        </p>
      )}
    </section>
  )
}
