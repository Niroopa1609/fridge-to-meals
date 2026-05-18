"use client"

import Image from "next/image"

const HERO_FOOD = "/recipe-generator/hero-food-panorama.png"

function HeartOutline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 21s-6.5-4.35-9-8.5C.5 8.5 2.5 5 6 5c1.74 0 3.41 1 4 2.5C10.59 6 12.26 5 14 5c3.5 0 5.5 3.5 3 7.5-2.5 4.15-9 8.5-9 8.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Full-bleed hero: cream scrim + script accent + food photo (matches product reference). */
export function RecipeHeroBanner() {
  return (
    <div className="relative mb-6 min-h-[10rem] w-full min-w-0 overflow-hidden rounded-3xl border border-[#E6E0D4]/80 bg-[#FDF8F3] shadow-[0_12px_40px_-14px_rgba(47,74,22,0.14)] sm:mb-8 sm:min-h-[11rem] md:min-h-[220px] md:max-h-[280px]">
      <Image
        src={HERO_FOOD}
        alt="Fresh grain bowl with chicken, avocado, and vegetables"
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
      />

      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[min(100%,21rem)] bg-[linear-gradient(to_right,rgba(253,248,243,0.98)_0%,rgba(255,249,241,0.9)_38%,rgba(255,249,241,0.5)_72%,transparent_100%)] sm:w-[min(100%,25rem)] md:w-[min(100%,30rem)]"
        aria-hidden
      />

      <div className="relative z-[2] flex min-h-[10rem] max-w-[min(100%,21rem)] flex-col justify-center gap-2 px-4 py-4 sm:min-h-[11rem] sm:max-w-[25rem] sm:px-6 sm:py-5 md:min-h-[220px] md:max-w-[30rem] md:px-8 md:py-6">
      <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-[#1B4332] px-3 py-1.5 font-sans text-[11px] font-semibold tracking-wide text-white shadow-md sm:text-sm">
        <span className="text-base leading-none" aria-hidden>
          ✨
        </span>
        Busy Life. Meals Decided
</span>

        <div className="min-w-0 space-y-0">
          <h2 className="font-serif text-lg font-semibold leading-[1.1] tracking-tight text-[#1C1C1C] sm:text-xl md:text-[1.65rem] lg:text-[1.85rem]">
            Cook something
          </h2>
          <p className="flex flex-wrap items-end gap-1.5">
            <span className="font-[var(--font-caveat)] text-2xl font-semibold italic leading-[1.05] text-[#F97316] sm:text-3xl md:text-[2.15rem] lg:text-[2.35rem]">
              amazing today
            </span>
            <HeartOutline className="mb-1 inline-block h-[1.1em] w-[1.1em] shrink-0 text-[#F97316]" />
          </p>
        </div>

        <p className="max-w-full font-sans text-[11px] font-normal leading-relaxed text-[#5C5C5C] sm:text-sm md:text-[15px]">
          Meals made from ingredients you already have
        </p>
      </div>
    </div>
  )
}
