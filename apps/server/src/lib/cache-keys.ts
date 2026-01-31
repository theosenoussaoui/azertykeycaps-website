import type {
  CacheInvalidationPayload,
  CacheSlug,
  TrpcEndpoint,
  PageDataEndpoint,
} from "@azertykeycaps-app/schemas";

/**
 * Mapping from content slugs to tRPC endpoints that need invalidation.
 * Uses Zod enum types for compile-time safety.
 */
const SLUG_TO_TRPC_ENDPOINTS: Record<CacheSlug, TrpcEndpoint[]> = {
  // Collections
  articles: ["articles.list", "articles.bySlug"],
  "keycap-profiles": ["articles.profiles", "articles.list"],
  media: [],
  // Globals
  homepage: ["articles.list", "articles.profiles", "globals.homepage"],
  "social-networks": ["globals.socialNetworks"],
  "informations-page": ["globals.informationsPage"],
  "suggestion-page": ["globals.suggestionPage"],
  "not-found-page": ["globals.notFoundPage"],
};

/**
 * Build tRPC cache keys to invalidate in Workers Cache API.
 */
export function buildCacheKeys(
  serverUrl: string,
  _type: "collection" | "global",
  slug: CacheSlug,
): string[] {
  const endpoints = SLUG_TO_TRPC_ENDPOINTS[slug] ?? [];

  return endpoints.map((endpoint) => `${serverUrl}/trpc/${endpoint}`);
}

/**
 * Cache tag builder helpers using typed prefixes.
 */
function tag(
  prefix: "page" | "global" | "article" | "profile" | "profile-articles",
  value: string,
): string {
  return `${prefix}:${value}`;
}

/**
 * Build cache tags for Cloudflare CDN purge.
 *
 * Tag naming conventions (must match apps/web/src/lib/cache-tags.ts):
 * - page:all                    → Universal tag, purges ALL pages
 * - global:homepage             → Homepage-specific content
 * - global:about                → About page content
 * - global:suggest              → Suggestion page content
 * - article:{slug}              → Individual article page
 * - profile:{slug}              → Individual profile page
 * - profile-articles:{slug}     → All articles belonging to a profile
 */
export function buildCacheTagsToPurge(
  payload: CacheInvalidationPayload,
): string[] {
  const tags: string[] = [];
  const { type, slug, articleSlug, profileSlug } = payload;

  if (type === "collection") {
    switch (slug) {
      case "articles":
        // Homepage shows latest articles
        tags.push(tag("global", "homepage"));
        // The specific article page
        if (articleSlug) {
          tags.push(tag("article", articleSlug));
        }
        // Profile page that lists this article
        if (profileSlug) {
          tags.push(tag("profile", profileSlug));
        }
        break;

      case "keycap-profiles":
        // Homepage shows profiles
        tags.push(tag("global", "homepage"));
        if (profileSlug) {
          // The profile page itself
          tags.push(tag("profile", profileSlug));
          // All articles belonging to this profile
          tags.push(tag("profile-articles", profileSlug));
        }
        break;

      case "media":
        // Media changes don't affect HTML cache
        break;
    }
  } else if (type === "global") {
    switch (slug) {
      case "homepage":
        tags.push(tag("global", "homepage"));
        break;
      case "informations-page":
        tags.push(tag("global", "about"));
        break;
      case "suggestion-page":
        tags.push(tag("global", "suggest"));
        break;
      case "social-networks":
        // Social links are in the footer - purge ALL pages
        tags.push(tag("page", "all"));
        break;
      case "not-found-page":
        // 404 page content - no specific tag needed
        break;
    }
  }

  return [...new Set(tags)];
}

/**
 * Mapping from content slugs to page data endpoints that need invalidation.
 * Uses Zod enum types for compile-time safety.
 */
const SLUG_TO_PAGE_DATA_ENDPOINTS: Partial<
  Record<CacheSlug, PageDataEndpoint[]>
> = {
  // Layout data (root loader)
  "social-networks": ["/api/pages/layout"],
  "keycap-profiles": ["/api/pages/layout", "/api/pages/home"],
  "not-found-page": ["/api/pages/layout"],
  // Homepage data
  articles: ["/api/pages/home"],
  homepage: ["/api/pages/home"],
};

/**
 * Build page data cache keys to invalidate.
 * These are the aggregated page data endpoints (/api/pages/*).
 */
export function buildPageDataCacheKeys(
  serverUrl: string,
  _type: "collection" | "global",
  slug: CacheSlug,
): string[] {
  const endpoints = SLUG_TO_PAGE_DATA_ENDPOINTS[slug] ?? [];

  return endpoints.map((endpoint) => `${serverUrl}${endpoint}`);
}
