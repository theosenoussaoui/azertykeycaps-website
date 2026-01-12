import type { MiddlewareHandler } from "hono";
import { cache } from "hono/cache";

/**
 * Cache names for different types of content
 * These are used to organize caches and enable selective invalidation
 */
export const CACHE_NAMES = {
  CMS_API: "cms-api-cache",
  MEDIA: "media-cache",
} as const;

/**
 * Check if we're running in development mode
 * In dev, Cloudflare Cache API is not available
 */
function isDevMode(): boolean {
  // In Cloudflare Workers, there's no process.env.NODE_ENV
  // We check if caches global is available and functional
  return typeof caches === "undefined";
}

/**
 * Development logging middleware
 * Logs what WOULD be cached in production
 */
function createDevCacheLogger(cacheName: string, cacheControl: string): MiddlewareHandler {
  return async (c, next) => {
    const startTime = Date.now();
    await next();
    const duration = Date.now() - startTime;

    console.log(
      `[cache:dev] ${c.req.method} ${c.req.url}\n` +
        `  Cache: ${cacheName}\n` +
        `  Would set: ${cacheControl}\n` +
        `  Status: ${c.res.status}\n` +
        `  Duration: ${duration}ms\n` +
        `  (Cache API not available in dev - request went to origin)`,
    );
  };
}

/**
 * Cache middleware for CMS API responses (tRPC queries)
 * TTL: 24 hours (86400 seconds)
 *
 * Used for:
 * - /trpc/articles.* endpoints
 * - Any CMS data fetched through tRPC
 *
 * Note: Only works on Cloudflare Workers with custom domains
 * Falls back to logging in development mode
 */
const CMS_CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=3600";

export const cmsCacheMiddleware: MiddlewareHandler = isDevMode()
  ? createDevCacheLogger(CACHE_NAMES.CMS_API, CMS_CACHE_CONTROL)
  : cache({
      cacheName: CACHE_NAMES.CMS_API,
      cacheControl: CMS_CACHE_CONTROL,
      keyGenerator: (c) => c.req.url,
    });

/**
 * Cache middleware for media proxy responses
 * TTL: 7 days (604800 seconds)
 *
 * Used for:
 * - /api/media/* endpoints (proxied from CMS)
 *
 * Images rarely change, so we use a longer TTL
 * Falls back to logging in development mode
 */
const MEDIA_CACHE_CONTROL = "public, max-age=604800, stale-while-revalidate=86400";

export const mediaCacheMiddleware: MiddlewareHandler = isDevMode()
  ? createDevCacheLogger(CACHE_NAMES.MEDIA, MEDIA_CACHE_CONTROL)
  : cache({
      cacheName: CACHE_NAMES.MEDIA,
      cacheControl: MEDIA_CACHE_CONTROL,
      keyGenerator: (c) => c.req.url,
    });

/**
 * Invalidate cache entries for a specific cache
 *
 * @param cacheName - The cache to invalidate
 * @param patterns - Optional URL patterns to match (if empty, invalidates entire cache)
 * @returns Number of entries invalidated
 */
export async function invalidateCache(
  cacheName: string,
  patterns?: string[],
): Promise<{ success: boolean; message: string }> {
  // In dev mode, caches API is not available
  if (isDevMode()) {
    console.log(
      `[cache:dev] Invalidation request for ${cacheName}\n` +
        `  Patterns: ${patterns?.join(", ") || "(full cache)"}\n` +
        `  (Cache API not available in dev - nothing to invalidate)`,
    );
    return {
      success: true,
      message: `[DEV] Would invalidate ${patterns?.length || "all"} entries from ${cacheName}`,
    };
  }

  try {
    const cacheStorage = await caches.open(cacheName);

    if (!patterns || patterns.length === 0) {
      // Note: Cloudflare Cache API doesn't support listing all keys
      // For full cache purge, we rely on the cache expiring naturally
      // or using Cloudflare's purge_cache API at the zone level
      return {
        success: true,
        message: `Cache ${cacheName} marked for invalidation (full purge requires Cloudflare API)`,
      };
    }

    // Delete specific URLs from cache
    const results = await Promise.all(
      patterns.map(async (pattern) => {
        const deleted = await cacheStorage.delete(pattern);
        return { pattern, deleted };
      }),
    );

    const deletedCount = results.filter((r) => r.deleted).length;
    return {
      success: true,
      message: `Invalidated ${deletedCount}/${patterns.length} cache entries from ${cacheName}`,
    };
  } catch (error) {
    console.error(`[cache] Failed to invalidate ${cacheName}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build cache keys for tRPC article endpoints based on invalidation type
 *
 * @param serverUrl - Base server URL
 * @param _type - Type of content that changed (collection or global)
 * @param slug - Collection/global slug
 * @returns Array of cache keys to invalidate
 */
export function buildCacheKeys(
  serverUrl: string,
  _type: "collection" | "global",
  slug: string,
): string[] {
  const keys: string[] = [];

  // Map content types to affected tRPC endpoints
  const endpointMap: Record<string, string[]> = {
    // Collections
    articles: ["articles.list", "articles.bySlug"],
    "keycap-profiles": ["articles.profiles", "articles.list"],
    media: [], // Media changes don't directly affect tRPC cache

    // Globals
    homepage: ["articles.list", "articles.profiles"],
    "social-networks": [],
    "dropshipping-info-page": [],
    "dropshipping-sites-page": [],
  };

  const endpoints = endpointMap[slug] || [];

  // Note: tRPC uses batch requests, so we can't easily predict exact URLs
  // We'll invalidate based on the endpoint prefix
  for (const endpoint of endpoints) {
    // This creates a pattern like: https://server.example.com/trpc/articles.list
    keys.push(`${serverUrl}/trpc/${endpoint}`);
  }

  return keys;
}
