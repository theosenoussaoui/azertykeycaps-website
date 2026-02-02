/**
 * CMS Constants
 *
 * These constants are duplicated from @azertykeycaps-app/schemas to avoid
 * workspace dependency issues with OpenNext/Cloudflare Workers builds.
 *
 * IMPORTANT: Keep these in sync with packages/schemas/src/profiles.ts and packages/schemas/src/articles.ts
 */

export const PROFILE_SHAPES = {
  SCULPTED: "sculpted",
  UNIFORM: "uniform",
} as const;

export const ARTICLE_STATUS = {
  IN_STOCK: "in_stock",
  EXTRAS_GB: "extras_gb",
  EXTRAS_IN_STOCK: "extras_in_stock",
  GB_RUNNING: "gb_running",
  GB_ENDED: "gb_ended",
  INTEREST_CHECK: "interest_check",
  OUT_OF_STOCK: "out_of_stock",
} as const;

export const ARTICLE_MATERIALS = {
  ABS_DOUBLE_SHOT: "abs_double_shot",
  ABS_PAD_PRINTED: "abs_pad_printed",
  ABS_SIMPLE: "abs_simple",
  ALUMINIUM: "aluminium",
  PBT_DOUBLE_SHOT: "pbt_double_shot",
  PBT_DYE_SUB: "pbt_dye_sub",
  PBT_LASER_PRINTED: "pbt_laser_printed",
} as const;
