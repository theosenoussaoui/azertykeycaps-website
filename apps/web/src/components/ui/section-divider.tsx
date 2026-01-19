import { cn } from "@/lib/utils";

/**
 * SectionDivider - Full-width horizontal line that spans the entire viewport.
 *
 * Used to visually separate sections with a line that extends beyond
 * the container width to the edges of the screen.
 *
 * Usage:
 * ```tsx
 * <SectionDivider />
 * ```
 */
interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen border-t border-border opacity-60",
        className,
      )}
      data-slot="section-divider"
    />
  );
}
