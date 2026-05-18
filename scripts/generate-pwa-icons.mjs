/**
 * Builds PWA + iOS + favicon PNGs from public/pwa-icon-source.png (preferred) or public/icon.svg.
 * Run: pnpm run generate:pwa-icons
 * (Invoked automatically before `next build`.)
 */
import { mkdirSync, readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const publicDir = join(root, "public")
const pngSource = join(publicDir, "pwa-icon-source.png")
const svgPath = join(publicDir, "icon.svg")
const outDir = join(publicDir, "icons")

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

async function writeContainPng(input, size, outPath) {
  await sharp(input)
    .resize(size, size, { fit: "contain", background: whiteBg })
    .png()
    .toFile(outPath)
}

async function generateFromPngBuffer(input) {
  mkdirSync(outDir, { recursive: true })

  await writeContainPng(input, 192, join(outDir, "icon-192.png"))
  await writeContainPng(input, 512, join(outDir, "icon-512.png"))
  const maskable = await makeMaskable512FromPng(input)
  await sharp(maskable).toFile(join(outDir, "icon-maskable-512.png"))

  // iOS home screen (apple-touch-icon) — 180×180 is the standard iPhone size
  await writeContainPng(input, 180, join(publicDir, "apple-icon.png"))

  // Browser favicons (replace v0 / Vercel defaults)
  await writeContainPng(input, 32, join(publicDir, "icon-light-32x32.png"))
  await writeContainPng(input, 32, join(publicDir, "icon-dark-32x32.png"))

  console.log(
    "Wrote public/icons/icon-192.png, icon-512.png, icon-maskable-512.png, public/apple-icon.png, favicon assets from public/pwa-icon-source.png",
  )
}

async function main() {
  if (existsSync(pngSource)) {
    const input = readFileSync(pngSource)
    await generateFromPngBuffer(input)
    return
  }

  if (existsSync(svgPath)) {
    mkdirSync(outDir, { recursive: true })
    const input = readFileSync(svgPath)
    await sharp(input, { density: 300 }).resize(192, 192).png().toFile(join(outDir, "icon-192.png"))
    await sharp(input, { density: 300 }).resize(512, 512).png().toFile(join(outDir, "icon-512.png"))
    await sharp(input, { density: 300 }).resize(512, 512).png().toFile(join(outDir, "icon-maskable-512.png"))
    await sharp(input, { density: 300 }).resize(180, 180).png().toFile(join(publicDir, "apple-icon.png"))
    await sharp(input, { density: 300 }).resize(32, 32).png().toFile(join(publicDir, "icon-light-32x32.png"))
    await sharp(input, { density: 300 }).resize(32, 32).png().toFile(join(publicDir, "icon-dark-32x32.png"))
    console.log("Wrote icon PNGs from public/icon.svg")
    return
  }

  console.error("Missing public/pwa-icon-source.png and public/icon.svg")
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
