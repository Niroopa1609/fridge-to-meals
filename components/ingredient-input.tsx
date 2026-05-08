"use client"

import { useCallback, useState } from "react"
import { Search, Plus, Mic, X } from "lucide-react"
import { useIngredientVoiceInput } from "@/hooks/use-ingredient-voice-input"

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
  const [inputValue, setInputValue] = useState("")
  const [isSuggestOpen, setIsSuggestOpen] = useState(false)

  const quickPickChips = (() => {
    const fridge = (fridgeQuickPicks ?? []).map((s) => s.trim()).filter(Boolean)
    if (fridge.length === 0) return QUICK_PICKS
    const seen = new Set<string>()
    const merged: string[] = []
    for (const s of fridge) {
      const k = normalizeIngredientKey(s)
      if (seen.has(k)) continue
      seen.add(k)
      merged.push(s)
    }
    for (const s of QUICK_PICKS) {
      const k = normalizeIngredientKey(s)
      if (seen.has(k)) continue
      seen.add(k)
      merged.push(s)
    }
    return merged
  })()

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

  const filteredSuggestions =
    inputValue.trim().length === 0
      ? []
      : SUGGESTED_INGREDIENTS.filter((s) => {
          const q = inputValue.trim().toLowerCase()
          const alreadySelected = ingredients.some((i) => normalizeIngredientKey(i) === normalizeIngredientKey(s))
          return s.toLowerCase().includes(q) && !alreadySelected
        }).slice(0, 8)

  return (
    <div className="space-y-3">
      <label className="flex items-baseline gap-2 text-sm font-medium text-[#1F3A2B]">
        <span>
          Ingredients <span className="text-[#F97316]">*</span>
        </span>
        <span className="text-xs font-normal text-[#1F3A2B]/55">(Pick or add directly)</span>
      </label>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {quickPickChips.map((pick) => (
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

      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1F3A2B]/40" />

          <div
            className="flex min-h-12 w-full flex-wrap items-center gap-2 rounded-lg border border-[#E2D9CC] bg-white py-2 pl-12 pr-[168px] text-sm text-[#1F3A2B] shadow-sm focus-within:border-[#F97316] focus-within:ring-1 focus-within:ring-[#F97316]"
            onMouseDown={() => setIsSuggestOpen(true)}
          >
            {ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="inline-flex items-center gap-1 rounded-full bg-[#E4ECD4] px-2.5 py-1 text-xs font-semibold text-[#4F6B1F]"
              >
                {ingredient}
                <button
                  type="button"
                  onClick={() => handleRemove(ingredient)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-[#D7E4BE]"
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
              className="min-w-[140px] flex-1 bg-transparent text-sm text-[#1F3A2B] placeholder:text-[#1F3A2B]/40 outline-none"
            />
          </div>

          {isSuggestOpen && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[52px] z-10 overflow-hidden rounded-lg border border-[#E2D9CC] bg-white shadow-sm">
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
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-[#1F3A2B] hover:bg-[#F7F3EB]"
                >
                  <span>{s}</span>
                  <span className="text-xs font-medium text-[#4F6B1F]/70">Add</span>
                </button>
              ))}
            </div>
          )}
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <button
              type="button"
              onClick={handleAddFromInput}
              className="inline-flex h-9 items-center rounded-md bg-[#F97316] px-4 text-sm font-semibold text-white hover:bg-[#F28C38]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add
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
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

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
