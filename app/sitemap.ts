import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site-url"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const lastModified = new Date()

  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/todays-picks`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/my-fridge`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/favorites`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/terms`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ]
}
