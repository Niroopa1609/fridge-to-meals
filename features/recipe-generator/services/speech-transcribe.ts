import { apiFetch } from "@/lib/api"
import { extensionForMime } from "@/lib/speech-browser"

export type TranscribeSpeechResponse = {
  text: string
}

export async function transcribeSpeechAudio(
  blob: Blob,
  mimeHint: string | undefined,
  requestId: string
): Promise<string> {
  const ext = extensionForMime(blob.type || mimeHint)
  const filename = `recording.${ext}`
  const form = new FormData()
  form.append("audio", blob, filename)

  const { res } = await apiFetch("/api/speech/transcribe", {
    method: "POST",
    body: form,
    requestId,
    safeLogFields: { speechTranscribe: true },
  })

  if (!res.ok) {
    throw new Error(`Transcription failed: ${res.status}`)
  }

  const data = (await res.json()) as TranscribeSpeechResponse
  if (typeof data.text !== "string") {
    throw new Error("Transcription response missing text")
  }
  return data.text
}
