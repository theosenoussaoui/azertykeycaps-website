import { cn } from "@/lib/utils";

const MOBILE_COLUMNS = 2;
const DESKTOP_COLUMNS = 8;

/**
 * GridLines - Responsive decorative grid overlay.
 *
 * Renders vertical lines spanning the full viewport height
 * to enforce visual consistency across the site.
 *
 * Features:
 * - Fixed positioning (covers full viewport)
 * - Responsive: 2 columns on mobile, 8 columns on desktop (md+)
 * - Aligned with max-w-7xl container (1280px)
 * - Subtle opacity for non-intrusive visual guide
 * - Decorative only (aria-hidden, pointer-events-none)
 * - z-0 (behind all content)
 * - Same padding as content containers
 */
export function GridLines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-30"
      data-slot="grid-lines"
    >
      {/* Inner container matches content container padding and max-width */}
      <div className="mx-auto size-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile: 2 columns */}
        <div className="grid size-full grid-cols-2 md:hidden">
          {Array.from({ length: MOBILE_COLUMNS }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-full border-l border-border",
                i === MOBILE_COLUMNS - 1 && "border-r",
              )}
            />
          ))}
        </div>
        {/* Desktop: 8 columns */}
        <div className="hidden size-full grid-cols-8 md:grid">
          {Array.from({ length: DESKTOP_COLUMNS }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-full border-l border-border",
                i === DESKTOP_COLUMNS - 1 && "border-r",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
