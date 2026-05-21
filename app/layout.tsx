import type { Metadata, Viewport } from 'next'
import type { ReactNode } from "react"
import { Caveat, Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import { AuthProvider } from "@/features/auth/context/auth-context"
import { FridgeCacheProvider } from "@/features/fridge/context/fridge-cache-context"
import { PreferencesCacheProvider } from "@/features/user-preferences/context/preferences-cache-context"
import { RecipesStateProvider } from "@/features/recipes/state/recipes-state"
import { StructuredData } from "@/components/structured-data"
import { Toaster } from "@/components/ui/sonner"
import { OnboardingGate } from "@/components/onboarding-gate"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import {
  SITE_DESCRIPTION,
  SITE_DESCRIPTION_LONG,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site-metadata"
import { getSiteUrl } from "@/lib/site-url"
import './globals.css'

const siteUrl = getSiteUrl()
const defaultTitle = `${SITE_NAME} - ${SITE_TAGLINE}`

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _playfair = Playfair_Display({ 
  subsets: ["latin"],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
});

const _caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#234A0F",
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_NAME,
    title: defaultTitle,
    description: SITE_DESCRIPTION_LONG,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE_DESCRIPTION_LONG,
    images: ["/icons/icon-512.png"],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        url: "/icon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className={`overflow-x-hidden bg-[#F7F3EB] ${_caveat.variable}`} suppressHydrationWarning>
      <body
        className="min-h-dvh overflow-x-hidden bg-[#F7F3EB] font-sans antialiased"
        suppressHydrationWarning
      >
        <StructuredData />
        <AuthProvider>
          <FridgeCacheProvider>
            <PreferencesCacheProvider>
              <RecipesStateProvider>
                <OnboardingGate />
                {children}
              </RecipesStateProvider>
            </PreferencesCacheProvider>
          </FridgeCacheProvider>
        </AuthProvider>
        <Toaster />
        <ServiceWorkerRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
