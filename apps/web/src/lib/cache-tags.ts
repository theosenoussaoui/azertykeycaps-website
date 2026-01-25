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

const DEFAULT_CACHE_CONTROL =
  "public, max-age=300, s-maxage=300, stale-while-revalidate=3600";

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
export function buildCacheHeaders(
  options: CacheTagsOptions = {},
  cacheControl: string = DEFAULT_CACHE_CONTROL,
): Record<string, string> {
  return {
    "Cache-Control": cacheControl,
    "Cache-Tag": buildCacheTags(options),
  };
}
