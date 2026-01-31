import { z } from "zod";

import { articleCardSchema, articleSchema } from "./articles";
import {
  homepageSchema,
  notFoundPageSchema,
  socialNetworksSchema,
} from "./globals";
import { keycapProfileRefSchema, keycapProfileSchema } from "./profiles";

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

/**
 * Article page data response - data needed by article detail page loader.
 * Aggregates: article (full), relatedArticles (same profile, max 4)
 * Note: relatedArticles have formatted date strings (not ISO)
 */
export const articlePageDataResponseSchema = z.object({
  article: articleSchema,
  relatedArticles: z.array(articleCardSchema),
});

/**
 * Profile page data response - data needed by profile page loader.
 * Aggregates: profile (full), articles (paginated/filtered), profileSlug
 * Note: articles.docs have formatted date strings (not ISO)
 */
export const profilePageDataResponseSchema = z.object({
  profile: keycapProfileSchema.nullable(),
  articles: articleListResponseSchema,
  profileSlug: z.string(),
});

// ============================================
// PAGE DATA TYPES
// ============================================

export type LayoutDataResponse = z.infer<typeof layoutDataResponseSchema>;
export type HomePageDataResponse = z.infer<typeof homePageDataResponseSchema>;
export type ArticlePageDataResponse = z.infer<
  typeof articlePageDataResponseSchema
>;
export type ProfilePageDataResponse = z.infer<
  typeof profilePageDataResponseSchema
>;
