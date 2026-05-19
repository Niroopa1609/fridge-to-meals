type ResponsesBody = Record<string, unknown>

function getOpenAiConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com").replace(/\/$/, "")
  const model = process.env.OPENAI_MODEL?.trim()
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured")
  if (!model) throw new Error("OPENAI_MODEL is not configured")
  return { apiKey, baseUrl, model }
}

function extractAssistantText(response: Record<string, unknown>): string {
  const outputObj = response.output
  if (!Array.isArray(outputObj) || outputObj.length === 0) {
    throw new Error("OpenAI response missing output")
  }
  let lastText: string | null = null
  for (const item of outputObj) {
    if (!item || typeof item !== "object") continue
    const outItem = item as Record<string, unknown>
    if (String(outItem.type) !== "message") continue
    const contentObj = outItem.content
    if (!Array.isArray(contentObj)) continue
    for (const part of contentObj) {
      if (!part || typeof part !== "object") continue
      const p = part as Record<string, unknown>
      if (String(p.type) === "output_text" && p.text != null) {
        lastText = String(p.text)
      }
    }
  }
  if (lastText != null) return lastText

  const firstOutput = outputObj[0]
  if (!firstOutput || typeof firstOutput !== "object") {
    throw new Error("OpenAI response output[0] not an object")
  }
  const fo = firstOutput as Record<string, unknown>
  const content = fo.content
  if (!Array.isArray(content) || content.length === 0) {
    throw new Error("OpenAI response missing content")
  }
  const firstContent = content[0]
  if (!firstContent || typeof firstContent !== "object") {
    throw new Error("OpenAI response content[0] not an object")
  }
  const textObj = (firstContent as Record<string, unknown>).text
  if (textObj == null) throw new Error("OpenAI response missing content[0].text")
  return String(textObj)
}

export async function generateJsonText(prompt: string): Promise<string> {
  const { apiKey, baseUrl, model } = getOpenAiConfig()
  const body: ResponsesBody = {
    model,
    input: prompt ?? "",
  }
  const res = await fetch(`${baseUrl}/v1/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new Error(`OpenAI request failed: ${res.status}${t ? ` ${t.slice(0, 200)}` : ""}`)
  }
  const json = (await res.json()) as Record<string, unknown>
  return extractAssistantText(json)
}

export async function generateJsonTextFromImages(userInstruction: string, imageDataUrls: string[]): Promise<string> {
  const { apiKey, baseUrl, model } = getOpenAiConfig()
  const content: Record<string, unknown>[] = [
    { type: "input_text", text: userInstruction ?? "" },
  ]
  for (const dataUrl of imageDataUrls) {
    content.push({
      type: "input_image",
      detail: "auto",
      image_url: dataUrl,
    })
  }
  const body: ResponsesBody = {
    model,
    input: [{ type: "message", role: "user", content }],
    store: false,
    text: { format: { type: "json_object" } },
  }
  const res = await fetch(`${baseUrl}/v1/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new Error(`OpenAI request failed: ${res.status}${t ? ` ${t.slice(0, 200)}` : ""}`)
  }
  const json = (await res.json()) as Record<string, unknown>
  return extractAssistantText(json)
}

export async function transcribeAudioWebm(bytes: Uint8Array, filename: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com").replace(/\/$/, "")
  const transcribeModel = process.env.OPENAI_TRANSCRIBE_MODEL?.trim() || "whisper-1"
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured")
  const form = new FormData()
  const blob = new Blob([bytes], { type: "application/octet-stream" })
  form.append("file", blob, filename)
  form.append("model", transcribeModel)
  form.append("response_format", "json")
  const res = await fetch(`${baseUrl}/v1/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })
  if (!res.ok) {
    throw new Error(`Transcription failed: ${res.status}`)
  }
  const data = (await res.json()) as { text?: string }
  return typeof data.text === "string" ? data.text : ""
}
