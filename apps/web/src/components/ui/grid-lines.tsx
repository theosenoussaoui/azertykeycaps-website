/**
 * GridLines - Responsive decorative grid overlay.
 *
 * Renders vertical lines spanning the full viewport height
 * to enforce visual consistency across the site.
 *
 * Features:
 * - Fixed positioning (covers full viewport)
 * - Responsive: 2 columns on mobile, 6 columns on desktop (md+)
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
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-full border-l border-border"
              style={i === 1 ? { borderRightWidth: "1px" } : undefined}
            />
          ))}
        </div>
        {/* Desktop: 6 columns */}
        <div className="hidden size-full grid-cols-6 md:grid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-full border-l border-border"
              style={i === 5 ? { borderRightWidth: "1px" } : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
