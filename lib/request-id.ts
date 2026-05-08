export function getRequestId(): string {
  // One requestId per user action / API call.
  return globalThis.crypto?.randomUUID?.() ?? fallbackUuid()
}

function fallbackUuid(): string {
  // RFC4122 v4-ish fallback for environments without crypto.randomUUID (should be rare in modern browsers).
  // Not cryptographically strong; only used for correlation IDs.
  const s: string[] = []
  const hex = "0123456789abcdef"
  for (let i = 0; i < 36; i++) s.push(hex[Math.floor(Math.random() * 16)])
  s[14] = "4"
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  s[19] = hex[(parseInt(s[19]!, 16) & 0x3) | 0x8]
  s[8] = s[13] = s[18] = s[23] = "-"
  return s.join("")
}

