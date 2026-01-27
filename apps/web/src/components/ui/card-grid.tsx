import { cn } from "@/lib/utils";

/**
 * CardGrid - Responsive grid container for cards.
 *
 * Cards are placed with no gap - the vertical grid lines come from the
 * GridLines overlay component.
 *
 * Responsive by default:
 * - Mobile: 2 columns
 * - Desktop (md+): 8 columns
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
 * Responsive: 2 columns on mobile, 8 on desktop.
 * GridCard uses border-l for vertical dividers.
 */
export function CardGrid({
  children,
  className,
  as: Component = "div",
}: CardGridProps) {
  return (
    <Component
      className={cn("grid grid-cols-2 items-stretch md:grid-cols-8", className)}
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
 * Left border creates vertical dividers between cards.
 *
 * Styling:
 * - Left border for vertical dividers (spans full cell height)
 * - Hover: subtle bg-accent highlight
 * - No shadow, no rounded corners (brutalist)
 */
export function GridCard({
  children,
  className,
  as: Component = "div",
}: GridCardProps) {
  return (
    <Component
      className={cn(
        "h-full border-l border-border/60 bg-card text-card-foreground transition-[background-color] duration-150 hover:bg-accent/50",
        className,
      )}
      data-slot="grid-card"
    >
      {children}
    </Component>
  );
}
