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
  articles: ["articles.list", "articles.bySlug"],
  "keycap-profiles": ["articles.profiles", "articles.list"],
  media: [],
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
  const { type, slug, articleSlug, profileSlug, previousProfileSlug } = payload;

  if (type === "collection") {
    switch (slug) {
      case "articles":
        tags.push(tag("global", "homepage"));
        if (articleSlug) {
          tags.push(tag("article", articleSlug));
        }
        if (profileSlug) {
          tags.push(tag("profile", profileSlug));
        }
        if (previousProfileSlug) {
          tags.push(tag("profile", previousProfileSlug));
        }
        break;

      case "keycap-profiles":
        tags.push(tag("global", "homepage"));
        if (profileSlug) {
          tags.push(tag("profile", profileSlug));
          tags.push(tag("profile-articles", profileSlug));
        }
        break;

      case "media":
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
        tags.push(tag("page", "all"));
        break;
      case "not-found-page":
        break;
    }
  }

  return [...new Set(tags)];
}

/**
 * Mapping from content slugs to page data endpoints that need invalidation.
 * Uses Zod enum types for compile-time safety.
 *
 * Note: /api/pages/article and /api/pages/profile are patterns that require
 * slug-based invalidation via buildDynamicPageDataCacheKeys().
 */
const SLUG_TO_PAGE_DATA_ENDPOINTS: Partial<
  Record<CacheSlug, PageDataEndpoint[]>
> = {
  "social-networks": ["/api/pages/layout"],
  "keycap-profiles": [
    "/api/pages/layout",
    "/api/pages/home",
    "/api/pages/profile",
  ],
  "not-found-page": ["/api/pages/layout"],
  articles: ["/api/pages/home", "/api/pages/article"],
  homepage: ["/api/pages/home"],
};

/**
 * Build page data cache keys to invalidate.
 * These are the aggregated page data endpoints (/api/pages/*).
 *
 * Note: This only handles static endpoints. For slug-based endpoints
 * like /api/pages/article/:slug, use buildDynamicPageDataCacheKeys().
 */
export function buildPageDataCacheKeys(
  serverUrl: string,
  _type: "collection" | "global",
  slug: CacheSlug,
): string[] {
  const endpoints = SLUG_TO_PAGE_DATA_ENDPOINTS[slug] ?? [];

  return endpoints
    .filter((e) => e !== "/api/pages/article" && e !== "/api/pages/profile")
    .map((endpoint) => `${serverUrl}${endpoint}`);
}

/**
 * Build dynamic page data cache keys for slug-based endpoints.
 * These require specific slugs from the invalidation payload.
 *
 * Handles:
 * - /api/pages/article/:articleSlug
 * - /api/pages/profile/:profileSlug (base URL only, no query params)
 * - /api/pages/profile/:previousProfileSlug (when article's profile changed)
 */
export function buildDynamicPageDataCacheKeys(
  serverUrl: string,
  payload: CacheInvalidationPayload,
): string[] {
  const keys: string[] = [];

  if (payload.articleSlug) {
    keys.push(`${serverUrl}/api/pages/article/${payload.articleSlug}`);
  }

  if (payload.profileSlug) {
    keys.push(`${serverUrl}/api/pages/profile/${payload.profileSlug}`);
  }

  if (payload.previousProfileSlug) {
    keys.push(`${serverUrl}/api/pages/profile/${payload.previousProfileSlug}`);
  }

  if (payload.relatedArticleSlugs) {
    for (const slug of payload.relatedArticleSlugs) {
      keys.push(`${serverUrl}/api/pages/article/${slug}`);
    }
  }

  return keys;
}
