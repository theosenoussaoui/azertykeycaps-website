import { z } from "zod";

import { articleCardSchema } from "./articles";
import {
  homepageSchema,
  notFoundPageSchema,
  socialNetworksSchema,
} from "./globals";
import { keycapProfileRefSchema } from "./profiles";

// ============================================
// PAGINATED RESPONSE FACTORY
// ============================================

export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    docs: z.array(itemSchema),
    totalDocs: z.number(),
    totalPages: z.number(),
    page: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
    error: z.string().nullable(),
  });

// ============================================
// SPECIFIC RESPONSE SCHEMAS
// ============================================

// Uses articleCardSchema for list responses (only fields selected in list query)
export const articleListResponseSchema =
  createPaginatedResponseSchema(articleCardSchema);

export const profileListResponseSchema = z.array(keycapProfileRefSchema);

// ============================================
// TYPES
// ============================================

export type ArticleListResponse = z.infer<typeof articleListResponseSchema>;
export type ProfileListResponse = z.infer<typeof profileListResponseSchema>;

// ============================================
// PAGE DATA RESPONSE SCHEMAS
// ============================================

/**
 * Layout data response - data needed by root loader for all pages.
 * Aggregates: socialNetworks, profiles, notFoundPage
 */
export const layoutDataResponseSchema = z.object({
  socialNetworks: socialNetworksSchema.nullable(),
  profiles: profileListResponseSchema,
  notFoundPage: notFoundPageSchema.nullable(),
});

/**
 * Homepage data response - data needed by homepage loader.
 * Aggregates: articles (latest 4), homepage content
 * Note: articles.docs have formatted date strings (not ISO)
 */
export const homePageDataResponseSchema = z.object({
  articles: articleListResponseSchema,
  homepage: homepageSchema.nullable(),
});

// ============================================
// PAGE DATA TYPES
// ============================================

export type LayoutDataResponse = z.infer<typeof layoutDataResponseSchema>;
export type HomePageDataResponse = z.infer<typeof homePageDataResponseSchema>;
