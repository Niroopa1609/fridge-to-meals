/**
 * Builds manifest PNGs from public/pwa-icon-source.png (preferred) or public/icon.svg.
 * Run: pnpm run generate:pwa-icons
 * (Invoked automatically before `next build`.)
 */
import { mkdirSync, readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const pngSource = join(root, "public", "pwa-icon-source.png")
const svgPath = join(root, "public", "icon.svg")
const outDir = join(root, "public", "icons")

const whiteBg = { r: 255, g: 255, b: 255, alpha: 1 }

/** Keeps artwork inside Android maskable safe zone (~center 76%). */
async function makeMaskable512FromPng(pngBuffer) {
  const size = 512
  const inner = Math.floor(size * 0.76)
  const innerBuf = await sharp(pngBuffer)
    .resize(inner, inner, { fit: "contain", background: whiteBg })
    .png()
    .toBuffer()
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: whiteBg,
    },
  })
    .composite([{ input: innerBuf, gravity: "center" }])
    .png()
    .toBuffer()
}

async function main() {
  mkdirSync(outDir, { recursive: true })

  if (existsSync(pngSource)) {
    const input = readFileSync(pngSource)
    await sharp(input)
      .resize(192, 192, { fit: "contain", background: whiteBg })
      .png()
      .toFile(join(outDir, "icon-192.png"))
    await sharp(input)
      .resize(512, 512, { fit: "contain", background: whiteBg })
      .png()
      .toFile(join(outDir, "icon-512.png"))
    const maskable = await makeMaskable512FromPng(input)
    await sharp(maskable).toFile(join(outDir, "icon-maskable-512.png"))
    console.log(
      "Wrote public/icons/icon-192.png, icon-512.png, icon-maskable-512.png from public/pwa-icon-source.png",
    )
    return
  }

  if (existsSync(svgPath)) {
    const input = readFileSync(svgPath)
    await sharp(input, { density: 300 }).resize(192, 192).png().toFile(join(outDir, "icon-192.png"))
    await sharp(input, { density: 300 }).resize(512, 512).png().toFile(join(outDir, "icon-512.png"))
    await sharp(input, { density: 300 }).resize(512, 512).png().toFile(join(outDir, "icon-maskable-512.png"))
    console.log(
      "Wrote public/icons/icon-192.png, icon-512.png, icon-maskable-512.png from public/icon.svg",
    )
    return
  }

  console.error("Missing public/pwa-icon-source.png and public/icon.svg")
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
