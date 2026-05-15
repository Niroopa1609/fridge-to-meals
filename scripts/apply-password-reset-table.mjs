/**
 * Creates public.password_reset_tokens (required for forgot-password emails).
 * Run once: node scripts/apply-password-reset-table.mjs
 *
 * Uses SUPABASE_DB_PASSWORD from .env.local and your project ref from NEXT_PUBLIC_SUPABASE_URL.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import pg from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const i = trimmed.indexOf("=")
    if (i === -1) continue
    const key = trimmed.slice(0, i).trim()
    let val = trimmed.slice(i + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

loadEnvLocal()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const password = process.env.SUPABASE_DB_PASSWORD || ""
const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
const projectRef = match?.[1]

if (!projectRef || !password || password.includes("{{")) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD in .env.local, then run again."
  )
  process.exit(1)
}

const sqlPath = path.join(root, "supabase/migrations/20250515120000_password_reset_tokens.sql")
const sql = fs.readFileSync(sqlPath, "utf8")

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  await client.query(sql)
  console.log("password_reset_tokens table is ready.")
} catch (e) {
  console.error("Migration failed:", e instanceof Error ? e.message : e)
  console.error(
    "\nAlternatively, open Supabase Dashboard → SQL Editor and run:\n",
    sqlPath
  )
  process.exit(1)
} finally {
  await client.end()
}
