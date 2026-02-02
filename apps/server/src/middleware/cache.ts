import type { Context, MiddlewareHandler } from "hono";
import { cache } from "hono/cache";

export const CACHE_NAMES = {
  MEDIA: "media-cache",
  CMS_API: "cms-api-cache",
  PAGE_DATA: "page-data-cache",
} as const;

function isDevMode(): boolean {
  try {
    const hasCacheApi =
      typeof caches !== "undefined" && typeof caches.open === "function";
    return !hasCacheApi;
  } catch {
    return true;
  }
}

function createDevCacheLogger(
  _cacheName: string,
  _cacheControl: string,
): MiddlewareHandler {
  return async (c, next) => {
    const startTime = Date.now();
    await next();
    const duration = Date.now() - startTime;

    console.log(
      `[cache:dev] ${c.req.method} ${new URL(c.req.url).pathname} - ${c.res.status} (${duration}ms)`,
    );
  };
}

const MEDIA_CACHE_CONTROL =
  "public, max-age=604800, stale-while-revalidate=86400";

export const mediaCacheMiddleware: MiddlewareHandler = isDevMode()
  ? createDevCacheLogger(CACHE_NAMES.MEDIA, MEDIA_CACHE_CONTROL)
  : cache({
      cacheName: CACHE_NAMES.MEDIA,
      cacheControl: MEDIA_CACHE_CONTROL,
      keyGenerator: (c) => c.req.url,
    });

/**
 * Cache middleware for aggregated page data endpoints.
 * Same TTL as CMS API cache (24 hours) for consistency.
 */
const PAGE_DATA_CACHE_CONTROL =
  "public, max-age=86400, stale-while-revalidate=3600";

export const pageDataCacheMiddleware: MiddlewareHandler = isDevMode()
  ? createDevCacheLogger(CACHE_NAMES.PAGE_DATA, PAGE_DATA_CACHE_CONTROL)
  : cache({
      cacheName: CACHE_NAMES.PAGE_DATA,
      cacheControl: PAGE_DATA_CACHE_CONTROL,
      keyGenerator: (c) => c.req.url,
    });

interface CacheStrategyOptions {
  cacheName: string;
  cacheControl: string;
  /** Custom cache key generator. Defaults to full URL. */
  keyGenerator?: (c: Context) => string;
  /** Conditionally skip caching. Returns true to cache, false to bypass. */
  shouldCache?: (c: Context) => boolean;
}

/**
 * Factory to create cache middleware with custom strategy.
 * Supports conditional caching and custom cache keys.
 */
export function createCacheMiddleware(
  options: CacheStrategyOptions,
): MiddlewareHandler {
  const {
    cacheName,
    cacheControl,
    keyGenerator = (c) => c.req.url,
    shouldCache = () => true,
  } = options;

  if (isDevMode()) {
    return createDevCacheLogger(cacheName, cacheControl);
  }

  const cacheMiddleware = cache({
    cacheName,
    cacheControl,
    keyGenerator,
  });

  return async (c, next) => {
    if (!shouldCache(c)) {
      await next();
      return;
    }

    return cacheMiddleware(c, next);
  };
}

/**
 * Cache middleware for profile page data endpoint.
 * Only caches base requests (no filters, page 1).
 * Filtered/paginated views bypass cache and go to origin.
 */
export const profilePageCacheMiddleware = createCacheMiddleware({
  cacheName: CACHE_NAMES.PAGE_DATA,
  cacheControl: PAGE_DATA_CACHE_CONTROL,
  keyGenerator: (c) => {
    const url = new URL(c.req.url);
    return `${url.origin}${url.pathname}`;
  },
  shouldCache: (c) => {
    const url = new URL(c.req.url);
    const page = url.searchParams.get("page");
    return (
      !url.searchParams.has("status") &&
      !url.searchParams.has("material") &&
      !url.searchParams.has("search") &&
      !url.searchParams.has("isNew") &&
      (!page || page === "1")
    );
  },
});

/**
 * Cache middleware for article page data endpoint.
 * Always caches - slug is the unique key.
 */
export const articlePageCacheMiddleware = createCacheMiddleware({
  cacheName: CACHE_NAMES.PAGE_DATA,
  cacheControl: PAGE_DATA_CACHE_CONTROL,
});

export async function invalidateCache(
  cacheName: string,
  patterns?: string[],
): Promise<{ success: boolean; message: string }> {
  if (isDevMode()) {
    console.log(
      `[cache:dev] Invalidation for ${cacheName}: ${patterns?.length ?? 0} patterns`,
    );
    return {
      success: true,
      message: `[DEV] Would invalidate ${patterns?.length || "all"} entries from ${cacheName}`,
    };
  }

  try {
    const cacheStorage = await caches.open(cacheName);

    if (!patterns || patterns.length === 0) {
      return {
        success: true,
        message: `Cache ${cacheName} marked for invalidation (full purge requires Cloudflare API)`,
      };
    }

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
