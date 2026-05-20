const DEFAULT_SITE_URL = "https://www.fridgetomeals.com"

/** Canonical origin for SEO, sitemap, and structured data. Set APP_URL in production. */
export function getSiteUrl(): string {
  return (process.env.APP_URL || DEFAULT_SITE_URL).replace(/\/$/, "")
}
