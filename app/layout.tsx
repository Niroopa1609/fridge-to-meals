import type { Metadata, Viewport } from 'next'
import type { ReactNode } from "react"
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import { AuthProvider } from "@/features/auth/context/auth-context"
import { RecipesStateProvider } from "@/features/recipes/state/recipes-state"
import { Toaster } from "@/components/ui/sonner"
import { OnboardingGate } from "@/components/onboarding-gate"
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _playfair = Playfair_Display({ 
  subsets: ["latin"],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Fridge To Meals - Busy life. Meals decided.',
  description: 'Generate delicious recipes based on the ingredients in your kitchen. Find meals that match your cuisine preferences, prep time, and cooking style.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className="overflow-x-hidden bg-[#F7F3EB]" suppressHydrationWarning>
      <body
        className="min-h-dvh overflow-x-hidden bg-[#F7F3EB] font-sans antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          <RecipesStateProvider>
            <OnboardingGate />
            {children}
          </RecipesStateProvider>
        </AuthProvider>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
