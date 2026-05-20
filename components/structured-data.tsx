import {
  SITE_DESCRIPTION,
  SITE_DESCRIPTION_LONG,
  SITE_KEYWORDS,
  SITE_NAME,
} from "@/lib/site-metadata"
import { getSiteUrl } from "@/lib/site-url"

export function StructuredData() {
  const url = getSiteUrl()
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION_LONG,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        keywords: SITE_KEYWORDS.join(", "),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
