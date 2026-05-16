/**
 * Rasterizes public/icon.svg to PNG sizes required for the web app manifest.
 * Run: pnpm run generate:pwa-icons
 * (Invoked automatically before `next build`.)
 */
import { mkdirSync, readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const svgPath = join(root, "public", "icon.svg")
const outDir = join(root, "public", "icons")

async function main() {
  mkdirSync(outDir, { recursive: true })
  if (!existsSync(svgPath)) {
    console.error("Missing public/icon.svg")
    process.exit(1)
  }
  const input = readFileSync(svgPath)
  await sharp(input, { density: 300 }).resize(192, 192).png().toFile(join(outDir, "icon-192.png"))
  await sharp(input, { density: 300 }).resize(512, 512).png().toFile(join(outDir, "icon-512.png"))
  console.log("Wrote public/icons/icon-192.png and icon-512.png")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
