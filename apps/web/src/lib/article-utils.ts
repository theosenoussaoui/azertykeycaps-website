import type { ArticleStatus } from "@azertykeycaps-app/schemas";

export const STATUS_VARIANTS: Record<
  ArticleStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  in_stock: "default",
  extras_gb: "secondary",
  extras_in_stock: "secondary",
  gb_running: "default",
  gb_ended: "outline",
  interest_check: "outline",
  out_of_stock: "destructive",
};
