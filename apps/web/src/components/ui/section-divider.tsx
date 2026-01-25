import { cn } from "@/lib/utils";

/**
 * SectionDivider - Horizontal line that spans the container width.
 *
 * Used to visually separate sections. Stays within the container bounds.
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
      className={cn("w-full border-t border-border opacity-60", className)}
      data-slot="section-divider"
    />
  );
}
