import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site-metadata"
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
        description: `${SITE_DESCRIPTION} ${SITE_TAGLINE}`,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
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
