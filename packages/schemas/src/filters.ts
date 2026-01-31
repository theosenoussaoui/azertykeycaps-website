import { z } from "zod";

import { articleMaterialSchema, articleStatusSchema } from "./articles";

// ============================================
// ROUTE SEARCH PARAMS (TanStack Router validateSearch)
// ============================================

export const articleFiltersSchema = z.object({
  page: z.number().min(1).catch(1),
  profile: z.string().optional(),
  status: articleStatusSchema.optional(),
  material: articleMaterialSchema.optional(),
  isNew: z.boolean().optional(),
  search: z.string().optional(),
});

export const profilePageFiltersSchema = z.object({
  page: z.number().min(1).optional().default(1),
  status: articleStatusSchema.optional(),
  material: articleMaterialSchema.optional(),
  isNew: z.boolean().optional(),
  search: z.string().optional(),
});

// ============================================
// tRPC INPUT SCHEMAS
// ============================================

export const articleListInputSchema = z.object({
  limit: z.number().min(1).max(100).default(12),
  page: z.number().min(1).default(1),
  profile: z.string().optional(),
  status: articleStatusSchema.optional(),
  material: articleMaterialSchema.optional(),
  isNew: z.boolean().optional(),
  search: z.string().optional(),
});

export const articleBySlugInputSchema = z.object({
  slug: z.string().min(1),
});

export const profileListInputSchema = z.object({
  limit: z.number().min(1).max(100).default(100),
});

// ============================================
// HONO QUERY PARAM SCHEMAS (with string coercion)
// ============================================

/**
 * Profile page query params schema for Hono endpoints.
 * Handles string-to-type coercion from URL query params.
 * Used with safeParse for validation with error handling.
 */
export const profilePageQueryParamsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  status: articleStatusSchema.optional(),
  material: articleMaterialSchema.optional(),
  isNew: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  search: z.string().optional(),
});

// ============================================
// TYPES
// ============================================

export type ArticleFilters = z.infer<typeof articleFiltersSchema>;
export type ProfilePageFilters = z.infer<typeof profilePageFiltersSchema>;
export type ProfilePageQueryParams = z.infer<
  typeof profilePageQueryParamsSchema
>;
export type ArticleListInput = z.infer<typeof articleListInputSchema>;
export type ArticleBySlugInput = z.infer<typeof articleBySlugInputSchema>;
export type ProfileListInput = z.infer<typeof profileListInputSchema>;
