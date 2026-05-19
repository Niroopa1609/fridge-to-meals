"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Apple,
  ArrowRight,
  Camera,
  Carrot,
  ChevronRight,
  Egg,
  Ellipsis,
  Leaf,
  Loader2,
  Lock,
  Milk,
  Package,
  Plus,
  Refrigerator,
  Sparkles,
  Square,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { MobileNav } from "../../components/mobile-nav"
import { DecorativeLeaves } from "@/features/recipe-generator/components/decorative-leaves"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/context/auth-context"
import type { FridgeCategory } from "@/features/fridge/categorize-ingredient"
import {
  filterSavedItemsByCategory,
  getFridgeSummaryEmptyMessage,
  getFridgeSummaryListTitle,
  normalizeSavedItemCategory,
  type FridgeSummarySelection,
} from "@/features/fridge/filter-saved-items-by-category"
import {
  addFridgeItems,
  deleteAllFridgeItems,
  deleteFridgeItem,
  detectFridgeIngredients,
  fetchFridgeItems,
  type FridgeItemDto,
} from "@/features/fridge/services/fridge"
import {
  resolveManualIngredients,
  type ManualResolvedItem,
} from "@/features/fridge/manual-ingredient-parse"

const CATEGORY_ORDER: FridgeCategory[] = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Proteins",
  "Pantry",
  "Others",
]

const MAX_UPLOAD_IMAGES = 3
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"])

type SelectedImage = { id: string; file: File; previewUrl: string }

type DetectedIngredientRow = {
  id: string
  name: string
  category: FridgeCategory
  confidence?: string
}

function validateImageFile(file: File): string | null {
  const mime = (file.type || "").toLowerCase()
  if (!ALLOWED_IMAGE_MIME.has(mime)) {
    return "Only JPG, JPEG, PNG, and WebP images are allowed."
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Each image must be at most 5 MB."
  }
  if (file.size === 0) {
    return "That file is empty."
  }
  return null
}

function normalizeCategoryFromApi(raw: string): FridgeCategory {
  const c = (raw ?? "").trim()
  if (CATEGORY_ORDER.includes(c as FridgeCategory)) {
    return c as FridgeCategory
  }
  return "Others"
}

function categoryIcon(category: FridgeCategory) {
  switch (category) {
    case "Vegetables":
      return Carrot
    case "Fruits":
      return Apple
    case "Dairy":
      return Milk
    case "Proteins":
      return Egg
    case "Pantry":
      return Package
    default:
      return Ellipsis
  }
}

function summaryCounts(items: FridgeItemDto[]): Record<FridgeCategory, number> {
  const base: Record<FridgeCategory, number> = {
    Vegetables: 0,
    Fruits: 0,
    Dairy: 0,
    Proteins: 0,
    Pantry: 0,
    Others: 0,
  }
  for (const it of items) {
    const c = normalizeSavedItemCategory(it.category)
    base[c] = (base[c] ?? 0) + 1
  }
  return base
}

export function MyFridgePage() {
  const router = useRouter()
  const { accessToken, user, isHydrated } = useAuth()
  const isLoggedIn = Boolean(isHydrated && user && accessToken)

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredientRow[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionError, setDetectionError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const [savedItems, setSavedItems] = useState<FridgeItemDto[]>([])
  const [loadSavedError, setLoadSavedError] = useState<string | null>(null)
  const [fridgeItemDeletePending, setFridgeItemDeletePending] = useState<Record<string, boolean>>({})
  const [removeAllFridgeOpen, setRemoveAllFridgeOpen] = useState(false)
  const [removeAllFridgeBusy, setRemoveAllFridgeBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<FridgeSummarySelection>("ALL")

  const [manualOpen, setManualOpen] = useState(false)
  const [manualStep, setManualStep] = useState<"input" | "preview">("input")
  const [manualPending, setManualPending] = useState<ManualResolvedItem[] | null>(null)
  const [manualSkippedExisting, setManualSkippedExisting] = useState(0)
  const [manualName, setManualName] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const summaryInventoryRef = useRef<HTMLDivElement>(null)
  const dragDepthRef = useRef(0)
  const detectAbortRef = useRef<AbortController | null>(null)

  const scrollSummaryInventory = useCallback(() => {
    requestAnimationFrame(() => {
      summaryInventoryRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    })
  }, [])

  const reloadSaved = useCallback(async () => {
    if (!accessToken) {
      setSavedItems([])
      return
    }
    setLoadSavedError(null)
    try {
      const data = await fetchFridgeItems(accessToken)
      setSavedItems(data)
    } catch {
      setLoadSavedError("Could not load your saved fridge.")
      setSavedItems([])
    }
  }, [accessToken])

  useEffect(() => {
    if (!isHydrated) return
    void reloadSaved()
  }, [isHydrated, reloadSaved])

  useEffect(() => {
    return () => detectAbortRef.current?.abort()
  }, [])

  const selectedImagesRef = useRef(selectedImages)
  selectedImagesRef.current = selectedImages

  useEffect(() => {
    return () => {
      for (const im of selectedImagesRef.current) {
        URL.revokeObjectURL(im.previewUrl)
      }
    }
  }, [])

  const clearSelectedImages = useCallback(() => {
    setSelectedImages((prev) => {
      for (const im of prev) {
        URL.revokeObjectURL(im.previewUrl)
      }
      return []
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const addSelectedImages = useCallback((incoming: File[]) => {
    if (incoming.length === 0) return
    setSelectedImages((prev) => {
      const remaining = MAX_UPLOAD_IMAGES - prev.length
      if (remaining <= 0) {
        toast.message(`You can upload at most ${MAX_UPLOAD_IMAGES} images at a time.`)
        return prev
      }
      const next = [...prev]
      let rejectedOverLimit = 0
      for (const f of incoming) {
        if (next.length >= MAX_UPLOAD_IMAGES) {
          rejectedOverLimit++
          continue
        }
        const err = validateImageFile(f)
        if (err) {
          toast.error(err)
          continue
        }
        next.push({
          id: crypto.randomUUID(),
          file: f,
          previewUrl: URL.createObjectURL(f),
        })
      }
      if (rejectedOverLimit > 0) {
        toast.message(`Only ${MAX_UPLOAD_IMAGES} images allowed. Extra file(s) were not added.`)
      }
      return next
    })
  }, [])

  const removeImage = (id: string) => {
    setSelectedImages((prev) => {
      const found = prev.find((x) => x.id === id)
      if (found) URL.revokeObjectURL(found.previewUrl)
      return prev.filter((x) => x.id !== id)
    })
  }

  const onPickFiles = (files: FileList | null) => {
    if (!files?.length) return
    setDetectionError(null)
    addSelectedImages(Array.from(files))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepthRef.current += 1
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) {
      setDragActive(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepthRef.current = 0
    setDragActive(false)
    if (e.dataTransfer.files?.length) {
      setDetectionError(null)
      addSelectedImages(Array.from(e.dataTransfer.files))
    }
  }

  const handleStopDetection = () => {
    detectAbortRef.current?.abort()
  }

  const handleDetectIngredients = async () => {
    setDetectionError(null)
    if (selectedImages.length === 0) return
    if (!accessToken) {
      toast.message("Please sign in to detect ingredients.")
      window.dispatchEvent(new Event("auth:signin"))
      return
    }
    detectAbortRef.current?.abort()
    const controller = new AbortController()
    detectAbortRef.current = controller
    setIsDetecting(true)
    try {
      const files = selectedImages.map((x) => x.file)
      const data = await detectFridgeIngredients(accessToken, files, controller.signal)
      const rows = (data.ingredients ?? [])
        .map((row) => ({
          id: crypto.randomUUID(),
          name: (row.name ?? "").trim(),
          category: normalizeCategoryFromApi(row.category ?? ""),
          confidence: row.confidence?.trim() || undefined,
        }))
        .filter((r) => r.name.length > 0)
      setDetectedIngredients(rows)
      if (rows.length === 0) {
        toast.message("No ingredients were found in those images.")
      }
    } catch (err) {
      if (controller.signal.aborted) {
        toast.message("Detection stopped.")
        return
      }
      const msg = err instanceof Error ? err.message : "Detection failed. Please try again."
      setDetectionError(msg)
      toast.error(msg)
    } finally {
      if (detectAbortRef.current === controller) {
        detectAbortRef.current = null
      }
      setIsDetecting(false)
    }
  }

  const counts = useMemo(() => summaryCounts(savedItems), [savedItems])

  const filteredSavedItems = useMemo(
    () => filterSavedItemsByCategory(savedItems, selectedCategory),
    [savedItems, selectedCategory]
  )

  const anyFridgeDeletePending = useMemo(
    () => Object.keys(fridgeItemDeletePending).length > 0,
    [fridgeItemDeletePending]
  )

  const handleDeleteSavedFridgeItem = useCallback(
    async (itemId: string) => {
      if (!accessToken) {
        toast.message("Please sign in to manage your fridge.")
        return
      }
      setFridgeItemDeletePending((p) => ({ ...p, [itemId]: true }))
      try {
        await deleteFridgeItem(accessToken, itemId)
        setSavedItems((prev) => prev.filter((x) => x.id !== itemId))
        toast.success("Removed from your fridge.")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not remove ingredient.")
      } finally {
        setFridgeItemDeletePending((p) => {
          const next = { ...p }
          delete next[itemId]
          return next
        })
      }
    },
    [accessToken]
  )

  const handleRemoveAllSavedFridge = useCallback(async () => {
    if (!accessToken) {
      toast.message("Please sign in to manage your fridge.")
      return
    }
    setRemoveAllFridgeBusy(true)
    try {
      await deleteAllFridgeItems(accessToken)
      setSavedItems([])
      setSelectedCategory("ALL")
      setRemoveAllFridgeOpen(false)
      toast.success("All saved ingredients were removed.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove all ingredients.")
    } finally {
      setRemoveAllFridgeBusy(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (savedItems.length === 0) setSelectedCategory("ALL")
  }, [savedItems.length])

  const removeDetectedIngredient = (id: string) => {
    setDetectedIngredients((rows) => rows.filter((r) => r.id !== id))
  }

  const resetManualDialog = useCallback(() => {
    setManualStep("input")
    setManualPending(null)
    setManualSkippedExisting(0)
    setManualName("")
  }, [])

  const applyManualAdds = useCallback(
    (items: ManualResolvedItem[], skippedExisting: number) => {
      if (items.length === 0) return
      setDetectedIngredients((rows) => [
        ...rows,
        ...items.map((it) => ({
          id: crypto.randomUUID(),
          name: it.name,
          category: it.category,
        })),
      ])
      setManualOpen(false)
      resetManualDialog()
      if (skippedExisting > 0) {
        toast.message("Some ingredients were already in your fridge.")
      }
      toast.success(`Added ${items.length} ingredient${items.length === 1 ? "" : "s"}.`)
    },
    [resetManualDialog]
  )

  const proceedManualAdd = () => {
    const existingLower = new Set([
      ...detectedIngredients.map((r) => r.name.trim().toLowerCase()),
      ...savedItems.map((s) => s.name.trim().toLowerCase()),
    ])
    const { toAdd, skippedExisting } = resolveManualIngredients(manualName, existingLower)

    if (toAdd.length === 0) {
      toast.error("Enter at least one new ingredient.")
      if (skippedExisting > 0) {
        toast.message("Some ingredients were already in your fridge.")
      }
      return
    }

    const hasCorrections = toAdd.some((i) => i.correction)
    if (hasCorrections) {
      setManualPending(toAdd)
      setManualSkippedExisting(skippedExisting)
      setManualStep("preview")
      return
    }

    applyManualAdds(toAdd, skippedExisting)
  }

  const confirmManualPreview = () => {
    if (!manualPending?.length) return
    applyManualAdds(manualPending, manualSkippedExisting)
  }

  const handleSave = async () => {
    if (detectedIngredients.length === 0) {
      toast.error("Detect ingredients or add items manually, then save.")
      return
    }
    if (!accessToken) {
      toast.message("Please sign in to save your fridge.")
      window.dispatchEvent(new Event("auth:signin"))
      return
    }
    setSaving(true)
    try {
      const payload = detectedIngredients.map((r) => ({ name: r.name, category: r.category }))
      const { added } = await addFridgeItems(accessToken, payload)
      await reloadSaved()
      clearSelectedImages()
      if (added > 0) {
        setDetectedIngredients([])
        setDetectionError(null)
      }
      toast.success(added > 0 ? `Saved ${added} new ingredient${added === 1 ? "" : "s"} to your fridge.` : "Your fridge is already up to date.")
    } catch {
      toast.error("Could not save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const saveableCount = detectedIngredients.length
  const canAddMoreImages = selectedImages.length < MAX_UPLOAD_IMAGES

  return (
    <div className="relative min-h-screen bg-[#F7F3EB] pb-24">
      <DecorativeLeaves />
      <Header variant="recipe" />

      <main className="mx-auto max-w-[1440px] overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1200px] space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="font-serif text-2xl font-semibold text-[#1F3A2B] sm:text-3xl">My Fridge</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-[#1F3A2B]/70">
              <span className="h-0.5 w-10 bg-[#F97316]" />
              <Leaf className="h-4 w-4 text-[#4F6B1F]" aria-hidden />
              <span className="h-0.5 w-10 bg-[#F97316]" />
            </div>
            <p className="mx-auto max-w-xl text-sm text-[#1F3A2B]/75">
              Upload photos of your groceries. We&apos;ll detect ingredients from all images.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
            {/* Upload panel */}
            <section className="flex h-full min-h-0 flex-col rounded-2xl border border-[#E2D9CC] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 shrink-0 flex items-start gap-2">
                <Camera className="mt-0.5 h-5 w-5 shrink-0 text-[#F97316]" aria-hidden />
                <div>
                  <h2 className="font-serif text-lg font-semibold text-[#1F3A2B]">Upload Grocery or Fridge Image</h2>
                  <p className="text-xs text-[#1F3A2B]/65 sm:text-sm">
                    JPG, PNG, or WebP — up to {MAX_UPLOAD_IMAGES} images, 5 MB each. Drag in or browse.
                  </p>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                multiple
                className="hidden"
                onChange={(e) => onPickFiles(e.target.files)}
              />

              <div
                className={cn(
                  "rounded-xl transition-colors",
                  dragActive ? "border-2 border-dashed border-[#F97316] bg-[#FFF4EC]/80 p-3" : "border-2 border-dashed border-transparent p-1"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-wrap gap-3">
                  {selectedImages.map((im) => (
                    <div
                      key={im.id}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#E2D9CC] bg-[#F7F3EB] shadow-sm sm:h-28 sm:w-28"
                    >
                      <Image
                        src={im.previewUrl}
                        alt="Grocery upload preview"
                        fill
                        className="object-cover"
                        sizes="112px"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(im.id)}
                        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#1F3A2B] shadow hover:bg-white"
                        aria-label="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {canAddMoreImages ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#E2D9CC] bg-[#F7F3EB]/80 text-[#1F3A2B]/60 transition hover:border-[#F97316]/50 hover:text-[#1F3A2B] sm:h-28 sm:w-28"
                      aria-label="Add image"
                    >
                      <Plus className="h-6 w-6" />
                      <span className="text-[10px] font-semibold sm:text-xs">Add</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <p className="mt-3 text-center text-xs font-medium text-[#1F3A2B]/60">
                {selectedImages.length} / {MAX_UPLOAD_IMAGES} image{selectedImages.length === 1 ? "" : "s"} selected
              </p>
              </div>

              <div
                className={cn(
                  "mt-4 flex w-full min-w-0 shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#4F6B1F] via-[#4F6B1F] to-[#6B8F3A] px-3 py-2.5 text-white shadow-[0_10px_28px_-10px_rgba(79,107,31,0.35)] transition-all duration-200 sm:gap-2.5 sm:px-4 sm:py-3 lg:mt-auto lg:pt-2",
                  selectedImages.length === 0 && "cursor-not-allowed opacity-50"
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (isDetecting || selectedImages.length === 0) return
                    void handleDetectIngredients()
                  }}
                  disabled={selectedImages.length === 0 || isDetecting}
                  aria-disabled={selectedImages.length === 0 || isDetecting}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2.5 text-left transition-all duration-200 sm:gap-3",
                    "enabled:hover:opacity-95",
                    "disabled:cursor-not-allowed disabled:pointer-events-none"
                  )}
                >
                  {isDetecting ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-white sm:h-6 sm:w-6" aria-hidden />
                  ) : (
                    <Sparkles className="h-5 w-5 shrink-0 text-white drop-shadow sm:h-6 sm:w-6" strokeWidth={2} aria-hidden />
                  )}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-base font-bold leading-tight text-white sm:text-lg">
                      {isDetecting ? "Detecting ingredients…" : "Detect Ingredients"}
                    </p>
                    <p className="text-[10px] font-medium text-white/95 sm:text-xs">
                      {isDetecting
                        ? "Tap stop to cancel"
                        : selectedImages.length === 0
                          ? "Add at least one image above"
                          : "Scan your grocery photos"}
                    </p>
                  </div>
                </button>
                {isDetecting ? (
                  <button
                    type="button"
                    onClick={handleStopDetection}
                    aria-label="Stop ingredient detection"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#4F6B1F] shadow-[0_3px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)] sm:h-10 sm:w-10"
                  >
                    <Square className="h-4 w-4 fill-current sm:h-[1.15rem] sm:w-[1.15rem]" strokeWidth={0} aria-hidden />
                  </button>
                ) : (
                  <span
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#4F6B1F] shadow-[0_3px_12px_rgba(0,0,0,0.1)] sm:h-10 sm:w-10"
                    aria-hidden
                  >
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                  </span>
                )}
              </div>
            </section>

            {/* Detected */}
            <section className="flex h-full min-h-0 flex-col rounded-2xl border border-[#E2D9CC] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 shrink-0 flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#4F6B1F]" aria-hidden />
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-[#1F3A2B]">Detected Ingredients</h2>
                    <p className="text-xs text-[#1F3A2B]/65 sm:text-sm">Review the ingredients detected from your images before saving.</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-[#E2D9CC] bg-[#F7F3EB] px-3 py-1 text-xs font-semibold text-[#1F3A2B]">
                  {detectedIngredients.length} detected
                </span>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
              {detectionError ? (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{detectionError}</p>
              ) : null}

              {detectedIngredients.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#E2D9CC] bg-[#F7F3EB]/50 py-10 text-center text-sm text-[#1F3A2B]/60">
                  Upload an image to detect ingredients automatically/ add items manually.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 rounded-xl border border-[#E2D9CC] bg-[#FBF8F2] p-3">
                  {detectedIngredients.map((row) => (
                    <span
                      key={row.id}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#E2D9CC] bg-white py-1 pl-2.5 pr-1 text-xs font-medium text-[#1F3A2B] shadow-sm"
                    >
                      <span className="truncate">{row.name}</span>
                      {row.confidence ? (
                        <span className="shrink-0 rounded-md bg-[#F7F3EB] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1F3A2B]/70">
                          {row.confidence}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeDetectedIngredient(row.id)}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#1F3A2B]/50 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${row.name}`}
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetManualDialog()
                  setManualOpen(true)
                }}
                className="mt-4 w-full shrink-0 border-[#F97316] bg-transparent font-semibold text-[#F97316] hover:bg-[#FFF4EC] lg:mt-auto lg:pt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item Manually
              </Button>
            </section>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              type="button"
              disabled={saving || saveableCount === 0}
              onClick={() => void handleSave()}
              className="h-12 w-full max-w-md rounded-md bg-[#F97316] text-base font-semibold text-white shadow-sm hover:bg-[#F28C38] disabled:opacity-50"
            >
              <Refrigerator className="mr-2 h-5 w-5" />
              {saving ? "Saving…" : "Save to My Fridge"}
            </Button>
            <p className="flex max-w-md items-center justify-center gap-1.5 text-center text-xs text-[#1F3A2B]/55">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Your fridge is private and only visible to you.
            </p>
          </div>

          {/* Summary */}
          <section
            id="fridge-summary"
            className="relative rounded-2xl border border-[#E2D9CC] bg-white p-5 pb-8 shadow-sm sm:p-6 sm:pb-10"
            aria-disabled={!isLoggedIn}
          >
            <div className={cn(!isLoggedIn && isHydrated && "opacity-45")}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Refrigerator className="mt-0.5 h-5 w-5 shrink-0 text-[#4F6B1F]" aria-hidden />
                <div>
                  <h2 className="font-serif text-lg font-semibold text-[#1F3A2B]">Your Fridge Summary</h2>
                  <p className="text-xs text-[#1F3A2B]/65 sm:text-sm">Overview of your saved ingredients.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!isLoggedIn}
                onClick={() => {
                  setSelectedCategory("ALL")
                  scrollSummaryInventory()
                }}
                className="shrink-0 font-semibold text-[#F97316] hover:bg-[#FFF4EC] hover:text-[#EA580C]"
                aria-label="Show all categories"
              >
                View All
                <ChevronRight
                  className={cn(
                    "ml-0.5 h-4 w-4 transition-transform duration-200",
                    selectedCategory !== "ALL" && "rotate-90"
                  )}
                />
              </Button>
            </div>

            {loadSavedError ? (
              <p className="mb-3 text-sm text-red-700">{loadSavedError}</p>
            ) : null}

            <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {CATEGORY_ORDER.map((cat) => {
                const Icon = categoryIcon(cat)
                const selected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    disabled={!isLoggedIn}
                    onClick={() => {
                      setSelectedCategory(cat)
                      scrollSummaryInventory()
                    }}
                    aria-pressed={selected}
                    className={cn(
                      "flex min-w-0 flex-col items-center rounded-lg border px-1.5 py-2 text-center shadow-sm transition-colors duration-200 ease-out sm:rounded-xl sm:px-3 sm:py-3",
                      selected
                        ? "border-[#4F6B1F] bg-[#E8F4DC] ring-2 ring-[#4F6B1F]/20"
                        : "border-[#E2D9CC] bg-[#F7F3EB]/60 hover:border-[#C9B99A] hover:bg-[#F2EDE3]"
                    )}
                  >
                    <Icon
                      className="mb-0.5 h-4 w-4 text-[#4F6B1F] sm:mb-1 sm:h-5 sm:w-5"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <p className="w-full truncate text-[10px] font-semibold leading-tight text-[#1F3A2B] sm:text-xs">
                      {cat}
                    </p>
                    <p className="text-sm font-bold text-[#1F3A2B] sm:text-lg">{counts[cat]}</p>
                  </button>
                )
              })}
            </div>

            {savedItems.length > 0 ? (
              <div
                id="fridge-summary-inventory"
                ref={summaryInventoryRef}
                className="mt-4 rounded-xl border border-[#E2D9CC] bg-[#FBF8F2] p-3"
              >
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <h3 className="text-sm font-semibold text-[#1F3A2B]">
                    {getFridgeSummaryListTitle(selectedCategory)}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 self-start border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800"
                    disabled={!isLoggedIn || removeAllFridgeBusy || anyFridgeDeletePending}
                    onClick={() => setRemoveAllFridgeOpen(true)}
                  >
                    Remove All
                  </Button>
                </div>
                <div
                  key={selectedCategory}
                  className="flex min-h-[2.5rem] flex-wrap gap-2 animate-in fade-in duration-200"
                >
                  {filteredSavedItems.length > 0 ? (
                    filteredSavedItems.map((s) => {
                      const busy = Boolean(fridgeItemDeletePending[s.id])
                      return (
                        <span
                          key={s.id}
                          className={cn(
                            "inline-flex max-w-full items-center gap-1 rounded-full border border-[#E2D9CC] bg-white py-1 pl-2.5 pr-1 text-xs font-medium text-[#1F3A2B]",
                            busy && "opacity-60"
                          )}
                        >
                          <span className="min-w-0 truncate">{s.name}</span>
                          <button
                            type="button"
                            disabled={busy || removeAllFridgeBusy}
                            onClick={() => void handleDeleteSavedFridgeItem(s.id)}
                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#1F3A2B]/45 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
                            aria-label={`Remove ${s.name} from saved fridge`}
                          >
                            {busy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            ) : (
                              <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                            )}
                          </button>
                        </span>
                      )
                    })
                  ) : (
                    <p className="text-sm text-[#1F3A2B]/60">
                      {getFridgeSummaryEmptyMessage(selectedCategory)}
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            <AlertDialog open={removeAllFridgeOpen} onOpenChange={setRemoveAllFridgeOpen}>
              <AlertDialogContent className="border-[#E2D9CC] bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-[#1F3A2B]">Remove all saved ingredients?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#1F3A2B]/75">
                    This will permanently delete every ingredient in your saved fridge for this account. Recipe
                    generator text fields are not changed. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                  <AlertDialogCancel
                    type="button"
                    disabled={removeAllFridgeBusy}
                    className="border-[#E2D9CC] text-[#1F3A2B] sm:mt-0"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={removeAllFridgeBusy}
                    className="w-full sm:w-auto"
                    onClick={() => void handleRemoveAllSavedFridge()}
                  >
                    {removeAllFridgeBusy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Removing…
                      </>
                    ) : (
                      "Remove all"
                    )}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {savedItems.length === 0 && isHydrated && isLoggedIn ? (
              <p className="mt-3 text-sm text-[#1F3A2B]/60">
                No saved ingredients yet. Detect ingredients, then use Save to My Fridge.
              </p>
            ) : null}
            </div>

            {!isLoggedIn && isHydrated ? (
              <button
                type="button"
                className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]/50"
                aria-label="Sign in to view your fridge summary"
                onClick={() => window.dispatchEvent(new Event("auth:signin"))}
              />
            ) : null}
          </section>
        </div>
      </main>

      <Dialog
        open={manualOpen}
        onOpenChange={(open) => {
          setManualOpen(open)
          if (!open) resetManualDialog()
        }}
      >
        <DialogContent className="border-[#E2D9CC] bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#1F3A2B]">Add ingredient</DialogTitle>
          </DialogHeader>

          {manualStep === "input" ? (
            <>
              <Textarea
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Tomato, onion, spinach, milk"
                className="min-h-[88px] resize-y border-[#E2D9CC] bg-white text-sm text-[#1F3A2B] placeholder:text-[#7A8B78] placeholder:opacity-70"
                rows={3}
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    proceedManualAdd()
                  }
                }}
              />
              <p className="text-xs leading-snug text-[#1F3A2B]/55">
                Add one or more ingredients separated by commas
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setManualOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" className="bg-[#F97316] hover:bg-[#F28C38]" onClick={proceedManualAdd}>
                  Add
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-[#1F3A2B]">We corrected these:</p>
              <ul className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-[#E2D9CC] bg-[#F7F3EB]/60 px-3 py-2 text-sm text-[#1F3A2B]">
                {manualPending
                  ?.filter((i) => i.correction)
                  .map((i, idx) => (
                    <li key={`${i.correction!.from}-${i.correction!.to}-${idx}`}>
                      <span className="text-[#1F3A2B]/70">{i.correction!.from}</span>
                      <span className="mx-1.5 text-[#1F3A2B]/45">→</span>
                      <span className="font-medium">{i.correction!.to}</span>
                    </li>
                  ))}
              </ul>
              <p className="text-xs text-[#1F3A2B]/60">
                {manualPending?.length ?? 0} ingredient{(manualPending?.length ?? 0) === 1 ? "" : "s"} will be added
                {manualPending?.some((i) => !i.correction) ? " (including items with no spelling change)." : "."}
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setManualStep("input")
                    setManualPending(null)
                  }}
                >
                  Back
                </Button>
                <Button type="button" className="bg-[#F97316] hover:bg-[#F28C38]" onClick={confirmManualPreview}>
                  Add to list
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <MobileNav
        activeTab="fridge"
        onTabChange={(tab: string) => {
          if (tab === "today") router.push("/todays-picks")
          if (tab === "planner") router.push("/")
          if (tab === "favorites") router.push("/favorites")
          if (tab === "fridge") router.push("/my-fridge")
          if (tab === "terms") router.push("/terms")
        }}
      />
    </div>
  )
}
