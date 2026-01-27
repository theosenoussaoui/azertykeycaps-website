/**
 * Cache-Tag utilities for Cloudflare CDN cache invalidation.
 *
 * How it works:
 * 1. Each page declares its cache tags via the `Cache-Tag` HTTP header
 * 2. Cloudflare indexes these tags when caching the response
 * 3. When content changes, we purge by tag (not URL)
 * 4. Cloudflare automatically invalidates all pages with matching tags
 *
 * Tag naming conventions:
 * - page:all                    → Universal tag, purges ALL pages (e.g., footer changes)
 * - global:homepage             → Homepage-specific content
 * - global:about                → About page content
 * - global:suggest              → Suggestion page content
 * - article:{slug}              → Individual article page
 * - profile:{slug}              → Individual profile page
 * - profile-articles:{slug}     → All articles belonging to a profile
 */

/**
 * Cache-Control values:
 * - max-age=300 (5 min): Browser cache freshness
 * - stale-while-revalidate=3600 (1 hour): Browser serves stale while revalidating
 *
 * CDN-Cache-Control (Cloudflare-specific):
 * - max-age=86400 (24 hours): CDN cache freshness (safe because we have cache-tag invalidation)
 * - stale-while-revalidate=604800 (7 days): CDN serves stale during origin issues
 *
 * This split strategy gives users fresh content (5 min browser cache) while
 * dramatically reducing origin load (24 hour CDN cache). Cache-tags ensure
 * instant invalidation when content changes in CMS.
 */
const DEFAULT_CACHE_CONTROL =
  "public, max-age=300, stale-while-revalidate=3600";
const DEFAULT_CDN_CACHE_CONTROL =
  "max-age=86400, stale-while-revalidate=604800";

export type GlobalTag = "homepage" | "about" | "suggest";

export interface CacheTagsOptions {
  /** Global page tags (homepage, about, suggest) */
  global?: GlobalTag[];
  /** Article slug for article detail pages */
  articleSlug?: string;
  /** Profile slug for profile pages */
  profileSlug?: string;
  /** Profile slug for articles that belong to a profile (for invalidation) */
  profileArticlesSlug?: string;
}

/**
 * Build cache tags string for the Cache-Tag HTTP header.
 *
 * @example
 * // Homepage
 * buildCacheTags({ global: ["homepage"] })
 * // → "page:all,global:homepage"
 *
 * @example
 * // Article page
 * buildCacheTags({ articleSlug: "gmk-dracula", profileArticlesSlug: "cherry" })
 * // → "page:all,article:gmk-dracula,profile-articles:cherry"
 *
 * @example
 * // Profile page
 * buildCacheTags({ profileSlug: "cherry" })
 * // → "page:all,profile:cherry"
 */
export function buildCacheTags(options: CacheTagsOptions = {}): string {
  const tags: string[] = ["page:all"];

  if (options.global) {
    for (const g of options.global) {
      tags.push(`global:${g}`);
    }
  }

  if (options.articleSlug) {
    tags.push(`article:${options.articleSlug}`);
  }

  if (options.profileSlug) {
    tags.push(`profile:${options.profileSlug}`);
  }

  if (options.profileArticlesSlug) {
    tags.push(`profile-articles:${options.profileArticlesSlug}`);
  }

  return tags.join(",");
}

/**
 * Build cache headers including Cache-Control and Cache-Tag.
 *
 * @example
 * // In route definition
 * headers: () => buildCacheHeaders({ global: ["homepage"] })
 *
 * @example
 * // With custom cache control
 * headers: () => buildCacheHeaders(
 *   { articleSlug: "foo" },
 *   "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
 * )
 */
export interface CacheHeadersConfig {
  /** Override browser Cache-Control header */
  cacheControl?: string;
  /** Override CDN-Cache-Control header (Cloudflare-specific) */
  cdnCacheControl?: string;
}

/**
 * Build cache headers including Cache-Control, CDN-Cache-Control, and Cache-Tag.
 *
 * @example
 * // In route definition (uses defaults: 5min browser, 24h CDN)
 * headers: () => buildCacheHeaders({ global: ["homepage"] })
 *
 * @example
 * // With custom cache control for frequently changing content
 * headers: () => buildCacheHeaders(
 *   { articleSlug: "foo" },
 *   { cacheControl: "public, max-age=60, stale-while-revalidate=300" }
 * )
 *
 * @example
 * // Disable CDN caching for private pages
 * headers: () => buildCacheHeaders(
 *   {},
 *   { cacheControl: "private, max-age=0" }
 * )
 */
export function buildCacheHeaders(
  options: CacheTagsOptions = {},
  config: CacheHeadersConfig = {},
): Record<string, string> {
  const cacheControl = config.cacheControl ?? DEFAULT_CACHE_CONTROL;
  const cdnCacheControl = config.cdnCacheControl ?? DEFAULT_CDN_CACHE_CONTROL;

  const headers: Record<string, string> = {
    "Cache-Control": cacheControl,
    "Cache-Tag": buildCacheTags(options),
  };

  // Only add CDN-Cache-Control if not using private caching
  if (!cacheControl.includes("private")) {
    headers["CDN-Cache-Control"] = cdnCacheControl;
  }

  return headers;
}
