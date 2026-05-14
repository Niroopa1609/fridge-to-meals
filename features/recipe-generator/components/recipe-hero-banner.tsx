"use client"

import Image from "next/image"
import { useState } from "react"

/** Wide strip art (~1024×196): baked-in text on raster left; we crop to food on the right. */
const HERO_REFERENCE = "/recipe-generator/hero-banner-visual.png"
const HERO_FOOD_FALLBACK = "/recipe-generator/hero-bowl.jpg"

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

export function RecipeHeroBanner() {
  const [src, setSrc] = useState(HERO_REFERENCE)
  const isReferenceStrip = src === HERO_REFERENCE

  return (
    <section className="w-full max-w-full min-w-0">
      {/* One wide strip everywhere: text | image (no stacked “text only” block on mobile) */}
      <div className="relative grid min-h-0 w-full grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] grid-rows-1 items-stretch overflow-hidden rounded-2xl border border-[#E8DFD0] shadow-[0_14px_44px_-14px_rgba(47,74,22,0.18)] min-h-[9rem] sm:min-h-[10.5rem] md:min-h-[232px] md:max-h-[280px]">
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#FFF9F1_0%,#FFF9F1_6%,#F9F4EC_20%,#F1E9DF_45%,#E5DCD3_70%,#D4CCC4_100%)]"
          aria-hidden
        />

        <div className="relative z-[1] flex min-h-0 min-w-0 flex-col justify-center gap-1 px-3 py-3 sm:gap-1.5 sm:px-4 sm:py-4 md:gap-2 md:px-7 md:py-5 md:pl-7 md:pr-3 lg:pl-8">
          <span className="inline-flex w-fit max-w-full items-center gap-1 rounded-full bg-[#1B4332] px-2 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm sm:px-2.5 sm:text-[10px] md:px-3 md:py-1 md:text-[11px]">
            <span className="text-[10px] leading-none text-amber-300/95 sm:text-[11px] md:text-[12px]" aria-hidden>
              ✨
            </span>
            AI-Powered
          </span>

          <div className="min-w-0 space-y-0">
            <h2 className="font-serif text-base font-semibold leading-[1.1] tracking-tight text-[#2D2D2D] sm:text-lg md:text-[1.55rem] lg:text-[1.72rem]">
              Cook something
            </h2>
            <p className="flex flex-wrap items-end gap-0.5 font-serif text-base font-semibold italic leading-[1.1] text-[#E67E22] sm:text-lg md:text-[1.62rem] lg:text-[1.78rem]">
              <span>amazing today</span>
              <HeartOutline className="mb-px inline-block h-[1em] w-[1em] shrink-0 text-[#E67E22] sm:h-[1.05em] sm:w-[1.05em]" />
            </p>
          </div>

          <p className="max-w-full font-sans text-[10px] font-normal leading-snug text-[#5C5C5C] sm:text-[11px] md:text-sm">
            AI recipes from ingredients you already have
          </p>
        </div>

        <div className="relative z-[1] min-h-0 min-w-0">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[32%] max-w-[5.5rem] bg-[linear-gradient(to_right,#FFF9F1_0%,rgba(255,249,241,0.88)_12%,rgba(255,249,241,0.45)_30%,rgba(255,249,241,0.12)_52%,transparent_72%)] sm:max-w-[7rem] md:w-[40%] md:max-w-[18rem]"
            aria-hidden
          />
          <Image
            src={src}
            alt="Fresh grain bowl with chicken, avocado, and vegetables"
            fill
            className={
              isReferenceStrip
                ? "object-cover object-[78%_center] sm:object-[82%_center] md:object-right"
                : "object-contain object-center p-2 sm:p-3 md:p-4"
            }
            sizes="(max-width: 768px) 55vw, 50vw"
            priority
            onError={() => setSrc((s) => (s === HERO_REFERENCE ? HERO_FOOD_FALLBACK : s))}
          />
        </div>
      </div>
    </section>
  )
}
