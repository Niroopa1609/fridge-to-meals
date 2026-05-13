"use client"

import { useCallback, useMemo, useState } from "react"
import { Search, Mic, X } from "lucide-react"
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

interface IngredientInputProps {
  ingredients: string[]
  onIngredientsChange: (ingredients: string[]) => void
  fridgeQuickPicks?: string[]
}

const QUICK_PICKS = [
  "Chicken",
  "Eggs",
  "Paneer",
  "Rice",
  "Spinach",
  "Broccoli",
  "Onion",
  "Tomato",
  "Pasta",
  "Beans",
]

function normalizeIngredientKey(value: string): string {
  return value.trim().toLowerCase()
}

function FridgeLineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 9h14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="12" r="0.75" fill="currentColor" />
      <circle cx="9" cy="15.5" r="0.75" fill="currentColor" />
    </svg>
  )
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
  "Beans",
  "Carrot",
  "Potato",
  "Milk",
  "Yogurt",
  "Cheese",
  "Lentils",
  "Chickpeas",
  "Tofu",
  "Mushroom",
  "Bell Pepper",
]

export function IngredientInput({
  ingredients,
  onIngredientsChange,
  fridgeQuickPicks,
}: IngredientInputProps) {
  const { user, isHydrated } = useAuth()
  const [inputValue, setInputValue] = useState("")
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
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean)
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

  return (
    <div className="w-full max-w-full min-w-0 space-y-3">
      <label className="flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-medium text-[#1F3A2B]">
        <span>
          Ingredients <span className="text-[#F97316]">*</span>
        </span>
        <span className="text-xs font-normal text-[#1F3A2B]/55">(Pick or add directly)</span>
      </label>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {QUICK_PICKS.map((pick) => (
            <button
              key={pick}
              type="button"
              onClick={() => {
                addIngredients([pick])
                setInputValue("")
                setIsSuggestOpen(false)
              }}
              className="rounded-full border border-[#E2D9CC] bg-white px-3 py-1 text-xs font-semibold text-[#4F6B1F] hover:border-[#F97316]/50 hover:bg-[#F7F3EB]"
            >
              {pick}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full max-w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2">
        <div className="relative min-w-0 w-full sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-[#1F3A2B]/40 sm:left-4 sm:h-5 sm:w-5" />

          <div
            className="flex min-h-11 w-full min-w-0 max-w-full flex-wrap items-center gap-1.5 rounded-lg border border-[#E2D9CC] bg-white py-1.5 pl-9 pr-2 text-sm text-[#1F3A2B] shadow-sm focus-within:border-[#F97316] focus-within:ring-1 focus-within:ring-[#F97316] sm:min-h-12 sm:gap-2 sm:py-2 sm:pl-12 sm:pr-3"
            onMouseDown={() => setIsSuggestOpen(true)}
          >
            {ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="inline-flex max-w-full min-w-0 shrink items-center gap-1 rounded-full bg-[#E4ECD4] px-2 py-0.5 text-xs font-semibold text-[#4F6B1F] sm:px-2.5 sm:py-1"
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
              type="text"
              placeholder={ingredients.length === 0 ? "Add ingredients..." : ""}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setIsSuggestOpen(true)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSuggestOpen(true)}
              onBlur={() => setTimeout(() => setIsSuggestOpen(false), 150)}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#1F3A2B] placeholder:text-[#1F3A2B]/40 outline-none sm:min-w-[6rem]"
            />
          </div>

          {isSuggestOpen && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-w-full overflow-hidden rounded-lg border border-[#E2D9CC] bg-white shadow-sm">
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
                  className="flex w-full min-w-0 max-w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-[#1F3A2B] hover:bg-[#F7F3EB] sm:px-4"
                >
                  <span className="min-w-0 truncate">{s}</span>
                  <span className="shrink-0 text-xs font-medium text-[#4F6B1F]/70">Add</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex w-full max-w-full shrink-0 items-center justify-center gap-2 sm:w-auto sm:justify-start sm:self-center sm:gap-2">
          <button
            type="button"
            onClick={handleFridgeAddButtonClick}
            aria-label="Add from your fridge"
            className="inline-flex h-9 min-h-9 shrink-0 items-center justify-center gap-1 rounded-md bg-[#F97316] px-2 py-0 text-[11px] font-semibold leading-tight text-white shadow-sm hover:bg-[#F28C38] max-[360px]:gap-0.5 max-[360px]:px-1.5 max-[360px]:text-[10px] sm:gap-1.5 sm:px-3 sm:text-sm sm:leading-none"
          >
            <FridgeLineIcon className="h-3.5 w-3.5 shrink-0 text-white sm:h-4 sm:w-4" />
            <span className="min-w-0 text-left">
              <span className="inline max-[360px]:hidden sm:inline">Add from your fridge</span>
              <span className="hidden max-[360px]:inline sm:hidden">From fridge</span>
            </span>
          </button>
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
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-white text-[#1F3A2B]/70 hover:bg-[#E4ECD4] hover:text-[#1F3A2B] disabled:pointer-events-none disabled:opacity-50 ${
              voiceUi.phase === "web_listening" || voiceUi.phase === "media_recording"
                ? "border-[#F97316] ring-1 ring-[#F97316]"
                : "border-[#E2D9CC]"
            }`}
          >
            <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
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
          className={`text-sm ${voiceUi.errorMessage ? "text-red-700" : "text-[#1F3A2B]/70"}`}
        >
          {voiceUi.errorMessage ?? voiceUi.statusMessage}
        </p>
      )}
    </div>
  )
}
