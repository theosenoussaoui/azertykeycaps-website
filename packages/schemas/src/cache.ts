import { z } from "zod";

// ============================================================================
// Cache Invalidation Enums
// ============================================================================

/**
 * Collection slugs that can be invalidated.
 * These correspond to Payload CMS collection slugs.
 */
export const collectionSlugSchema = z.enum([
  "articles",
  "keycap-profiles",
  "media",
]);
export type CollectionSlug = z.infer<typeof collectionSlugSchema>;
export const COLLECTION_SLUGS = collectionSlugSchema.options;

/**
 * Global slugs that can be invalidated.
 * These correspond to Payload CMS global slugs.
 */
export const globalSlugSchema = z.enum([
  "homepage",
  "social-networks",
  "informations-page",
  "suggestion-page",
  "not-found-page",
]);
export type GlobalSlug = z.infer<typeof globalSlugSchema>;
export const GLOBAL_SLUGS = globalSlugSchema.options;

/**
 * Combined slug schema for cache invalidation.
 */
export const cacheSlugSchema = z.union([
  collectionSlugSchema,
  globalSlugSchema,
]);
export type CacheSlug = z.infer<typeof cacheSlugSchema>;

/**
 * tRPC endpoint identifiers that can be cache-invalidated.
 */
export const trpcEndpointSchema = z.enum([
  "articles.list",
  "articles.bySlug",
  "articles.profiles",
  "globals.homepage",
  "globals.socialNetworks",
  "globals.informationsPage",
  "globals.suggestionPage",
  "globals.notFoundPage",
]);
export type TrpcEndpoint = z.infer<typeof trpcEndpointSchema>;
export const TRPC_ENDPOINTS = trpcEndpointSchema.options;

/**
 * Page data endpoint paths that can be cache-invalidated.
 * Note: /api/pages/article and /api/pages/profile are patterns (require slug).
 */
export const pageDataEndpointSchema = z.enum([
  "/api/pages/layout",
  "/api/pages/home",
  "/api/pages/article",
  "/api/pages/profile",
]);
export type PageDataEndpoint = z.infer<typeof pageDataEndpointSchema>;
export const PAGE_DATA_ENDPOINTS = pageDataEndpointSchema.options;

/**
 * Cache tag prefixes for CDN purge.
 * Format: prefix:value (e.g., "article:my-article-slug")
 */
export const cacheTagPrefixSchema = z.enum([
  "page",
  "global",
  "article",
  "profile",
  "profile-articles",
]);
export type CacheTagPrefix = z.infer<typeof cacheTagPrefixSchema>;
export const CACHE_TAG_PREFIXES = cacheTagPrefixSchema.options;

// ============================================================================
// Cache Invalidation Payload
// ============================================================================

export const cacheInvalidationPayloadSchema = z.object({
  type: z.enum(["collection", "global"]),
  slug: cacheSlugSchema,
  id: z.string().optional(),
  articleSlug: z.string().optional(),
  profileSlug: z.string().optional(),
  previousProfileSlug: z.string().optional(),
  relatedArticleSlugs: z.array(z.string()).optional(),
});

export type CacheInvalidationPayload = z.infer<
  typeof cacheInvalidationPayloadSchema
>;
