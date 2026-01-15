import type { MiddlewareHandler } from "hono";
import { cache } from "hono/cache";

export const CACHE_NAMES = {
  MEDIA: "media-cache",
  CMS_API: "cms-api-cache",
} as const;

export interface CacheInvalidationPayload {
  type: "collection" | "global";
  slug: string;
  id?: string;
  articleSlug?: string;
  profileSlug?: string;
  relatedArticleSlugs?: string[];
}

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
    "social-networks": ["globals.socialNetworks"],
    "informations-page": ["globals.informationsPage"],
    "suggestion-page": ["globals.suggestionPage"],
  };

  const endpoints = endpointMap[slug] || [];

  for (const endpoint of endpoints) {
    keys.push(`${serverUrl}/trpc/${endpoint}`);
  }

  return keys;
}

export function buildUrlsToPurge(webUrl: string, payload: CacheInvalidationPayload): string[] {
  const urls: string[] = [];
  const { type, slug, articleSlug, profileSlug, relatedArticleSlugs } = payload;

  if (type === "collection") {
    switch (slug) {
      case "articles":
        urls.push(`${webUrl}/`);
        if (articleSlug) {
          urls.push(`${webUrl}/articles/${articleSlug}`);
        }
        if (profileSlug) {
          urls.push(`${webUrl}/profile/${profileSlug}`);
        }
        break;

      case "keycap-profiles":
        urls.push(`${webUrl}/`);
        if (profileSlug) {
          urls.push(`${webUrl}/profile/${profileSlug}`);
        }
        if (relatedArticleSlugs && relatedArticleSlugs.length > 0) {
          for (const slug of relatedArticleSlugs) {
            urls.push(`${webUrl}/articles/${slug}`);
          }
        }
        break;

      case "media":
        break;
    }
  } else if (type === "global") {
    switch (slug) {
      case "informations-page":
        urls.push(`${webUrl}/about`);
        break;
      case "suggestion-page":
        urls.push(`${webUrl}/suggest`);
        break;
      case "social-networks":
        urls.push(`${webUrl}/`);
        urls.push(`${webUrl}/about`);
        urls.push(`${webUrl}/suggest`);
        break;
      case "homepage":
        urls.push(`${webUrl}/`);
        break;
    }
  }

  return [...new Set(urls)];
}

export async function purgeCloudflareCDN(
  zoneId: string,
  apiToken: string,
  webUrl: string,
  payload: CacheInvalidationPayload,
): Promise<{ success: boolean; message: string; purgedUrls?: string[] }> {
  const urlsToPurge = buildUrlsToPurge(webUrl, payload);

  if (urlsToPurge.length === 0) {
    return {
      success: true,
      message: "No CDN URLs to purge for this content type",
    };
  }

  console.log("[cache] URLs to purge:", JSON.stringify(urlsToPurge));

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

    const responseData = await response.json();
    console.log("[cache] Cloudflare purge response:", JSON.stringify(responseData));

    if (!response.ok) {
      return { success: false, message: `Cloudflare API error: ${JSON.stringify(responseData)}` };
    }

    return {
      success: true,
      message: `Purged ${urlsToPurge.length} URLs`,
      purgedUrls: urlsToPurge,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
