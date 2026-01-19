import { cn } from "@/lib/utils";

/**
 * CardGrid - Responsive grid container for cards.
 *
 * Cards are placed with no gap - the vertical grid lines come from the
 * GridLines overlay component.
 *
 * Responsive by default:
 * - Mobile: 2 columns (matches GridLines)
 * - Desktop (md+): 6 columns (matches GridLines)
 *
 * Usage:
 * ```tsx
 * <CardGrid>
 *   <GridCard className="col-span-2 md:col-span-2">Content</GridCard>
 * </CardGrid>
 * ```
 *
 * @see docs/design/GRID_INSPIRATION.md
 */

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
  /** HTML element to render as */
  as?: "div" | "ul" | "section";
}

/**
 * Grid container for cards.
 * Responsive: 2 columns on mobile, 6 on desktop (matches GridLines).
 * No gap - vertical lines come from GridLines overlay.
 */
export function CardGrid({
  children,
  className,
  as: Component = "div",
}: CardGridProps) {
  return (
    <Component
      className={cn("grid grid-cols-2 md:grid-cols-6", className)}
      data-slot="card-grid"
    >
      {children}
    </Component>
  );
}

interface GridCardProps {
  children: React.ReactNode;
  className?: string;
  /** HTML element to render as */
  as?: "div" | "li" | "article";
}

/**
 * Card for use within CardGrid.
 * Vertical grid lines come from the GridLines overlay.
 * Horizontal lines (top/bottom of grid) come from SectionDivider.
 *
 * Styling:
 * - No borders (handled by GridLines + SectionDivider)
 * - No shadow, no rounded corners (brutalist)
 */
export function GridCard({
  children,
  className,
  as: Component = "div",
}: GridCardProps) {
  return (
    <Component
      className={cn("bg-card text-card-foreground", className)}
      data-slot="grid-card"
    >
      {children}
    </Component>
  );
}
