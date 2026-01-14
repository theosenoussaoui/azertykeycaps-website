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

export function buildCacheKeys(
  serverUrl: string,
  _type: "collection" | "global",
  slug: string,
): string[] {
  const keys: string[] = [];

  const endpointMap: Record<string, string[]> = {
    articles: ["articles.list", "articles.bySlug"],
    "keycap-profiles": ["articles.profiles", "articles.list"],
    media: [],
    homepage: ["articles.list", "articles.profiles"],
    "social-networks": [],
    "informations-page": ["globals.informationsPage"],
    "suggestion-page": ["globals.suggestionPage"],
  };

  const endpoints = endpointMap[slug] || [];

  for (const endpoint of endpoints) {
    keys.push(`${serverUrl}/trpc/${endpoint}`);
  }

  return keys;
}

export async function purgeCloudflareCDN(
  zoneId: string,
  apiToken: string,
  webUrl: string,
  type: "collection" | "global",
  slug: string,
  articleSlug?: string,
  serverUrl?: string,
): Promise<{ success: boolean; message: string; purgedUrls?: string[] }> {
  const urlsToPurge: string[] = [];

  if (serverUrl) {
    const apiEndpoints = buildCacheKeys(serverUrl, type, slug);
    urlsToPurge.push(...apiEndpoints);
  }

  if (type === "collection") {
    switch (slug) {
      case "articles":
        urlsToPurge.push(`${webUrl}/`);
        if (articleSlug) {
          urlsToPurge.push(`${webUrl}/articles/${articleSlug}`);
        }
        break;
      case "keycap-profiles":
        urlsToPurge.push(`${webUrl}/`);
        break;
    }
  } else if (type === "global") {
    switch (slug) {
      case "informations-page":
        urlsToPurge.push(`${webUrl}/about`);
        break;
      case "suggestion-page":
        urlsToPurge.push(`${webUrl}/suggest`);
        break;
      case "social-networks":
        urlsToPurge.push(`${webUrl}/`);
        urlsToPurge.push(`${webUrl}/about`);
        break;
    }
  }

  if (urlsToPurge.length === 0) {
    return {
      success: true,
      message: "No CDN URLs to purge for this content type",
    };
  }

  console.log("[cache] URLs to purge:", urlsToPurge);

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: urlsToPurge }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, message: `Cloudflare API error: ${error}` };
    }

    return {
      success: true,
      message: `Purged ${urlsToPurge.length} URLs from Cloudflare CDN`,
      purgedUrls: urlsToPurge,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
