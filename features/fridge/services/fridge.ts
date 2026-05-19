import { apiFetch } from "@/lib/api"
import { getRequestId } from "@/lib/request-id"
import type { FridgeCategory } from "@/features/fridge/categorize-ingredient"

export type FridgeItemDto = {
  id: string
  name: string
  category: string
  createdAt: string
}

export async function fetchFridgeItems(accessToken: string): Promise<FridgeItemDto[]> {
  const requestId = getRequestId()
  const { res } = await apiFetch("/api/fridge", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    requestId,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Fetch failed: ${res.status}`)
  }
  return (await res.json()) as FridgeItemDto[]
}

export async function addFridgeItems(
  accessToken: string,
  items: { name: string; category: FridgeCategory }[]
): Promise<{ added: number }> {
  const requestId = getRequestId()
  const { res } = await apiFetch("/api/fridge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ items }),
    requestId,
    safeLogFields: { fridgeItemCount: items.length },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Save failed: ${res.status}`)
  }
  return (await res.json()) as { added: number }
}

export async function deleteFridgeItem(accessToken: string, itemId: string): Promise<void> {
  const requestId = getRequestId()
  const { res } = await apiFetch(`/api/fridge/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    requestId,
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string; error?: string } | null
    const msg =
      (typeof body?.message === "string" && body.message) ||
      (typeof body?.error === "string" && body.error) ||
      `Remove failed (${res.status})`
    throw new Error(msg)
  }
}

export async function deleteAllFridgeItems(accessToken: string): Promise<{ removed: number }> {
  const requestId = getRequestId()
  const { res } = await apiFetch("/api/fridge/remove-all", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    requestId,
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string; error?: string } | null
    const msg =
      (typeof body?.message === "string" && body.message) ||
      (typeof body?.error === "string" && body.error) ||
      `Remove all failed (${res.status})`
    throw new Error(msg)
  }
  return (await res.json()) as { removed: number }
}

export type DetectedIngredientDto = {
  name: string
  category: string
  confidence?: string | null
}

export type DetectIngredientsResponse = {
  ingredients: DetectedIngredientDto[]
}

export async function detectFridgeIngredients(
  accessToken: string,
  files: File[],
  signal?: AbortSignal
): Promise<DetectIngredientsResponse> {
  const requestId = getRequestId()
  const formData = new FormData()
  for (const f of files) {
    formData.append("images", f, f.name)
  }
  const { res } = await apiFetch("/api/fridge/detect-ingredients", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
    signal,
    requestId,
    safeLogFields: { imageCount: files.length },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string; message?: string } | null
    const msg =
      (typeof body?.message === "string" && body.message) ||
      (typeof body?.error === "string" && body.error) ||
      `Detection failed (${res.status})`
    throw new Error(msg)
  }
  return (await res.json()) as DetectIngredientsResponse
}
