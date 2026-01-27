import { z } from "zod";

import { payloadIdSchema, seoFieldsSchema } from "./common";
import { mediaSchema } from "./media";
import { keycapProfileRefSchema } from "./profiles";

// ============================================
// CONSTANTS (i18n keys stored in CMS)
// ============================================

export const ARTICLE_STATUS = {
  IN_STOCK: "in_stock",
  EXTRAS_GB: "extras_gb",
  EXTRAS_IN_STOCK: "extras_in_stock",
  GB_RUNNING: "gb_running",
  GB_ENDED: "gb_ended",
  INTEREST_CHECK: "interest_check",
  OUT_OF_STOCK: "out_of_stock",
} as const;

export const ARTICLE_STATUS_VALUES = Object.values(ARTICLE_STATUS);
export type ArticleStatus =
  (typeof ARTICLE_STATUS)[keyof typeof ARTICLE_STATUS];

export const ARTICLE_MATERIALS = {
  ABS_DOUBLE_SHOT: "abs_double_shot",
  ABS_PAD_PRINTED: "abs_pad_printed",
  ABS_SIMPLE: "abs_simple",
  ALUMINIUM: "aluminium",
  PBT_DOUBLE_SHOT: "pbt_double_shot",
  PBT_DYE_SUB: "pbt_dye_sub",
  PBT_LASER_PRINTED: "pbt_laser_printed",
} as const;

export const ARTICLE_MATERIAL_VALUES = Object.values(ARTICLE_MATERIALS);
export type ArticleMaterial =
  (typeof ARTICLE_MATERIALS)[keyof typeof ARTICLE_MATERIALS];

// ============================================
// SCHEMAS
// ============================================

export const articleStatusSchema = z.enum([
  ARTICLE_STATUS.IN_STOCK,
  ARTICLE_STATUS.EXTRAS_GB,
  ARTICLE_STATUS.EXTRAS_IN_STOCK,
  ARTICLE_STATUS.GB_RUNNING,
  ARTICLE_STATUS.GB_ENDED,
  ARTICLE_STATUS.INTEREST_CHECK,
  ARTICLE_STATUS.OUT_OF_STOCK,
]);

export const articleMaterialSchema = z.enum([
  ARTICLE_MATERIALS.ABS_DOUBLE_SHOT,
  ARTICLE_MATERIALS.ABS_PAD_PRINTED,
  ARTICLE_MATERIALS.ABS_SIMPLE,
  ARTICLE_MATERIALS.ALUMINIUM,
  ARTICLE_MATERIALS.PBT_DOUBLE_SHOT,
  ARTICLE_MATERIALS.PBT_DYE_SUB,
  ARTICLE_MATERIALS.PBT_LASER_PRINTED,
]);

// Schema for article list items (cards) - only fields selected in list query
export const articleListItemSchema = z.object({
  id: payloadIdSchema,
  title: z.string(),
  slug: z.string(),
  img: mediaSchema,
  profile: keycapProfileRefSchema,
  status: articleStatusSchema,
  isNew: z.boolean(),
});

// Schema for full article (detail page) - all fields
// Full article schema - all fields from CMS
export const articleSchema = z
  .object({
    id: payloadIdSchema,
    title: z.string(),
    slug: z.string(),
    img: mediaSchema,
    profile: keycapProfileRefSchema,
    material: articleMaterialSchema.nullish(),
    description: z.string().nullish(),
    status: articleStatusSchema,
    startDate: z.string().nullish(),
    endDate: z.string().nullish(),
    url: z.string(),
    additionalUrl: z.string().nullish(),
    affiliateUrl: z.string().nullish(),
    warningText: z.string().nullish(),
    isNew: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .merge(seoFieldsSchema);

// ============================================
// UI SCHEMAS (derived from base schema)
// ============================================

// Article card schema - fields needed for rich list/grid display
export const articleCardSchema = articleSchema.pick({
  id: true,
  title: true,
  slug: true,
  img: true,
  profile: true,
  material: true,
  status: true,
  startDate: true,
  endDate: true,
  url: true,
  additionalUrl: true,
  warningText: true,
  isNew: true,
});

// ============================================
// TYPES
// ============================================

export type Article = z.infer<typeof articleSchema>;
export type ArticleCard = z.infer<typeof articleCardSchema>;
