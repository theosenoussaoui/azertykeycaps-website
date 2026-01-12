import { z } from "zod";

import { mediaSchema } from "./media";

// ============================================
// CONSTANTS (i18n keys)
// ============================================

export const WEBSITE_CATEGORIES = {
  ACCESSORIES: "accessories",
  ARTISANS: "artisans",
  KEYBOARDS: "keyboards",
  CABLES: "cables",
  KEYCAPS: "keycaps",
  PCB: "pcb",
  PLATES: "plates",
  SWITCHES: "switches",
} as const;

export const WEBSITE_CATEGORY_VALUES = Object.values(WEBSITE_CATEGORIES);
export type WebsiteCategory = (typeof WEBSITE_CATEGORIES)[keyof typeof WEBSITE_CATEGORIES];

// ============================================
// SCHEMAS
// ============================================

export const websiteCategorySchema = z.enum([
  WEBSITE_CATEGORIES.ACCESSORIES,
  WEBSITE_CATEGORIES.ARTISANS,
  WEBSITE_CATEGORIES.KEYBOARDS,
  WEBSITE_CATEGORIES.CABLES,
  WEBSITE_CATEGORIES.KEYCAPS,
  WEBSITE_CATEGORIES.PCB,
  WEBSITE_CATEGORIES.PLATES,
  WEBSITE_CATEGORIES.SWITCHES,
]);

export const dropshippingWebsiteSchema = z.object({
  id: z.coerce.string(),
  title: z.string(),
  slug: z.string(),
  banner: mediaSchema.nullable(),
  description: z.string().nullable(),
  examples: z.string().nullable(),
  categories: z.array(websiteCategorySchema).nullable(),
  url: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// TYPES
// ============================================

export type DropshippingWebsite = z.infer<typeof dropshippingWebsiteSchema>;
