/**
 * Fixed bottom banners (PWA install, push prompt) sit above MobileNav:
 * pill h-[3.25rem] + pt-2 + pb-[max(0.75rem, safe-area)] ≈ 5–6rem+.
 */
export const fixedBannerAboveMobileNav = "bottom-[10.5rem] sm:bottom-[5.5rem]"

/** When install + push banners are both visible on mobile. */
export const fixedBannerStackedTier2 = "bottom-[calc(10.5rem+8.5rem)] sm:bottom-[calc(5.5rem+8.5rem)]"
