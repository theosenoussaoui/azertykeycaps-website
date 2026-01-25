import { cn } from "@/lib/utils";

const MOBILE_COLUMNS = 2;
const DESKTOP_COLUMNS = 4;

/**
 * GridLines - Responsive decorative grid overlay.
 *
 * Renders vertical lines spanning the full viewport height
 * constrained within the max-w-7xl container bounds.
 *
 * Features:
 * - Fixed positioning with flex centering
 * - Responsive: 2 columns on mobile, 4 columns on desktop (md+)
 * - Constrained to max-w-7xl container (1280px) - does NOT extend to viewport edges
 * - opacity-60 for visibility
 * - Decorative only (aria-hidden, pointer-events-none)
 * - z-0 (behind all content)
 */
export function GridLines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 flex justify-center opacity-60"
      data-slot="grid-lines"
    >
      {/* Constrained inner container - matches page container */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
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
        {/* Desktop: 4 columns */}
        <div className="hidden size-full grid-cols-4 md:grid">
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
