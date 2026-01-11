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
// TYPES
// ============================================

export type ArticleFilters = z.infer<typeof articleFiltersSchema>;
export type ArticleListInput = z.infer<typeof articleListInputSchema>;
export type ArticleBySlugInput = z.infer<typeof articleBySlugInputSchema>;
export type ProfileListInput = z.infer<typeof profileListInputSchema>;
