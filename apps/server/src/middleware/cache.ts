import type { MiddlewareHandler } from "hono";
import { cache } from "hono/cache";

export const CACHE_NAMES = {
  MEDIA: "media-cache",
  CMS_API: "cms-api-cache",
} as const;

function isDevMode(): boolean {
  try {
    const hasCacheApi = typeof caches !== "undefined" && typeof caches.open === "function";
    return !hasCacheApi;
  } catch {
    return true;
  }
}

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

const MEDIA_CACHE_CONTROL = "public, max-age=604800, stale-while-revalidate=86400";

export const mediaCacheMiddleware: MiddlewareHandler = isDevMode()
  ? createDevCacheLogger(CACHE_NAMES.MEDIA, MEDIA_CACHE_CONTROL)
  : cache({
      cacheName: CACHE_NAMES.MEDIA,
      cacheControl: MEDIA_CACHE_CONTROL,
      keyGenerator: (c) => c.req.url,
    });

export async function invalidateCache(
  cacheName: string,
  patterns?: string[],
): Promise<{ success: boolean; message: string }> {
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
