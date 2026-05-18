"use client"

import type { ReactNode } from "react"
import { useCallback, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { DecorativeLeaves } from "@/features/recipe-generator/components/decorative-leaves"
import { cn } from "@/lib/utils"

const SUPPORT = "support@fridgetomeals.com"

export type LegalPanelId = "about" | "terms" | "privacy" | "contact"

const OPEN_PARAM_KEYS: Record<string, LegalPanelId | null> = {
  about: "about",
  terms: "terms",
  privacy: "privacy",
  contact: "contact",
}

function AboutBody() {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-[#1F3A2B]/85 sm:text-base">
      <p>
        Fridge To Meals helps busy people turn real ingredients into real dinners. Save what you have (My Fridge),
        note what you tend to eat, then let the app propose meals that respect your pantry and your rhythms—not a
        glossy recipe feed that ignores what&apos;s actually sitting in front of you.
      </p>
      <p>
        And if figuring out what to cook for the next meal—often for{" "}
        <strong className="font-semibold text-[#1F3A2B]/95">every meal, every single day—</strong>
        sometimes feels tiring, distracting, or just plain draining, Fridge To Meals aims to soften that grind. The
        focus is simpler decisions, fewer repetitive &ldquo;okay… now what?&rdquo; moments, and more confidence picking
        something realistic from what&apos;s already in your kitchen.
      </p>
      <p>
        Whether you&apos;re planning ahead or scrambling at 6 p.m., the goal stays the same: less meal-decision
        fatigue, more straightforward, personalized suggestions. Prefer Today&apos;s Picks for inspiration, Favorites
        for repeats, or the generator when you&apos;re ready to go deeper—everything is built to calm that
        &ldquo;nothing sounds good&rdquo; paralysis and help meals feel less mentally heavy.
      </p>
      <p>
        Questions? Reach us at{" "}
        <a href={`mailto:${SUPPORT}`} className="font-medium text-[#F97316] underline-offset-2 hover:underline">
          {SUPPORT}
        </a>
        .
      </p>
    </div>
  )
}

function TermsOfUseBody() {
  return (
    <div className="space-y-8 text-[15px] leading-relaxed text-[#1F3A2B]/85 sm:text-base">
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">1. Use of Service</h3>
        <p>You may use the app for personal meal planning and recipe generation, subject to these terms.</p>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">2. AI-Generated Content Disclaimer</h3>
        <ul className="list-inside list-disc space-y-2 pl-1 text-[#1F3A2B]/80">
          <li>Recipes are AI-generated suggestions</li>
          <li>Accuracy is not guaranteed</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">3. Allergy &amp; Food Safety Disclaimer</h3>
        <p>
          You are responsible for verifying ingredients, allergies, and food safety before cooking or consuming any
          recipe.
        </p>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">4. Account Responsibility</h3>
        <p>You are responsible for maintaining the security of your account credentials and for activity under your account.</p>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">5. Service Availability</h3>
        <p>
          The service may change, be updated, or become temporarily unavailable at any time. We do not guarantee
          uninterrupted access.
        </p>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">6. Prohibited Use</h3>
        <p>You agree not to:</p>
        <ul className="list-inside list-disc space-y-2 pl-1 text-[#1F3A2B]/80">
          <li>Abuse, spam, or harass others</li>
          <li>Use automated means to misuse or overload the platform</li>
          <li>Attempt to disrupt, reverse-engineer, or compromise the service or its infrastructure</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">7. Limitation of Liability</h3>
        <p>
          The app is provided &ldquo;as is&rdquo; without warranties of any kind. To the fullest extent permitted by law,
          we disclaim liability for indirect, incidental, or consequential damages arising from your use of the service.
        </p>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">8. Contact</h3>
        <p>
          For questions about these terms:{" "}
          <a href={`mailto:${SUPPORT}`} className="font-medium text-[#F97316] underline-offset-2 hover:underline">
            {SUPPORT}
          </a>
        </p>
      </section>
      <p className="border-t border-[#EDE7DC] pt-6 text-sm text-[#1F3A2B]/55">Last updated: May 15, 2026</p>
    </div>
  )
}

function PrivacyBody() {
  return (
    <div className="space-y-8 text-[15px] leading-relaxed text-[#1F3A2B]/85 sm:text-base">
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">1. Information We Collect</h3>
        <p>We collect information that you provide directly and information generated when you use the service:</p>
        <ul className="list-inside list-disc space-y-2 pl-1 text-[#1F3A2B]/80">
          <li>Account information such as email address</li>
          <li>Saved fridge ingredients</li>
          <li>Recipe preferences and favorites</li>
          <li>Uploaded food or fridge images</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">2. How We Use Information</h3>
        <ul className="list-inside list-disc space-y-2 pl-1 text-[#1F3A2B]/80">
          <li>Generate personalized recipe recommendations</li>
          <li>Improve recipe suggestions</li>
          <li>Store user preferences and favorites</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">3. Third-Party Services</h3>
        <p>We rely on trusted providers to operate the application:</p>
        <ul className="list-inside list-disc space-y-2 pl-1 text-[#1F3A2B]/80">
          <li>Supabase for authentication and database</li>
          <li>OpenAI for AI-generated recipe suggestions</li>
          <li>Pexels for recipe images</li>
        </ul>
        <p className="text-sm text-[#1F3A2B]/65">
          These services process data according to their own policies. We recommend reviewing their privacy terms when
          you use our app.
        </p>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">4. Data Protection</h3>
        <ul className="list-inside list-disc space-y-2 pl-1 text-[#1F3A2B]/80">
          <li>User data is securely stored</li>
          <li>We do not sell personal information</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">5. AI Disclaimer</h3>
        <ul className="list-inside list-disc space-y-2 pl-1 text-[#1F3A2B]/80">
          <li>AI-generated recipes may not always be accurate</li>
          <li>Users should verify allergies, ingredients, and food safety</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-[#1F3A2B] sm:text-xl">6. Contact</h3>
        <p>
          Questions about this policy? Contact us at{" "}
          <a href={`mailto:${SUPPORT}`} className="font-medium text-[#F97316] underline-offset-2 hover:underline">
            {SUPPORT}
          </a>
          .
        </p>
      </section>
      <p className="border-t border-[#EDE7DC] pt-6 text-sm text-[#1F3A2B]/55">Last updated: May 15, 2026</p>
    </div>
  )
}

function ContactBody() {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-[#1F3A2B]/85 sm:text-base">
      <p>We are glad to help with account issues, feedback, or questions about the service.</p>
      <p>
        Email:{" "}
        <a href={`mailto:${SUPPORT}`} className="font-medium text-[#F97316] underline-offset-2 hover:underline">
          {SUPPORT}
        </a>
      </p>
    </div>
  )
}

function AccordionPanel({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: LegalPanelId
  title: string
  open: boolean
  onToggle: (id: LegalPanelId) => void
  children: ReactNode
}) {
  const panelId = `legal-panel-${id}`
  const buttonId = `legal-trigger-${id}`

  return (
    <li>
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "flex min-h-[3rem] w-full items-center gap-3 px-4 py-3.5 text-left transition-colors sm:min-h-[3.25rem] sm:px-5",
          "text-[15px] font-medium text-[#1F3A2B] hover:bg-[#FAF7F0] active:bg-[#F3EEE4]",
          open && "bg-[#FAF8F5]/95"
        )}
        onClick={() => onToggle(id)}
      >
        <span className="min-w-0 flex-1">{title}</span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-[#1F3A2B]/35 transition-transform duration-200", open && "-rotate-180")}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="border-t border-[#EDE7DC] bg-[#FFFCF9]/95 px-4 pb-5 pt-4 sm:px-5"
        >
          {children}
        </div>
      ) : null}
    </li>
  )
}

const ROWS: { id: LegalPanelId; title: string; body: ReactNode }[] = [
  { id: "about", title: "About Us", body: <AboutBody /> },
  { id: "terms", title: "Terms Of Use", body: <TermsOfUseBody /> },
  { id: "privacy", title: "Privacy Policy", body: <PrivacyBody /> },
  { id: "contact", title: "Contact Us", body: <ContactBody /> },
]

export function TermsHubPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const openId = useMemo((): LegalPanelId | null => {
    const raw = searchParams.get("open")
    if (raw == null || raw.trim() === "") return null
    return OPEN_PARAM_KEYS[raw.toLowerCase()] ?? null
  }, [searchParams])

  const toggle = useCallback(
    (id: LegalPanelId) => {
      if (openId === id) {
        router.replace("/terms", { scroll: false })
      } else {
        router.replace(`/terms?open=${id}`, { scroll: false })
      }
    },
    [openId, router]
  )

  return (
    <div className="relative min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F8F5EF] pb-[5.5rem] sm:pb-24">
      <DecorativeLeaves />
      <Header variant="recipe" />

      <main className="mx-auto w-full max-w-6xl min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:max-w-[1200px] lg:px-10">
        <section aria-label="Policies and support">
          <div className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-white shadow-sm">
            <ul className="divide-y divide-[#EDE7DC]">
              {ROWS.map(({ id, title, body }) => (
                <AccordionPanel key={id} id={id} title={title} open={openId === id} onToggle={toggle}>
                  {body}
                </AccordionPanel>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <MobileNav
        activeTab="terms"
        onTabChange={(tab) => {
          if (tab === "today") router.push("/todays-picks")
          if (tab === "planner") router.push("/")
          if (tab === "fridge") router.push("/my-fridge")
          if (tab === "favorites") router.push("/favorites")
          if (tab === "terms") router.push("/terms")
        }}
      />
    </div>
  )
}
