import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";

/**
 * Cache Invalidation Hooks for Payload CMS
 *
 * These hooks trigger cache invalidation when content changes in the CMS.
 * They use the "fire-and-forget" pattern (non-blocking) since cache invalidation
 * doesn't need to block the CMS response.
 *
 * Two caches are invalidated:
 * 1. Server cache (CMS API responses) - via /api/cache/invalidate endpoint
 * 2. Cloudflare CDN cache (HTML pages) - via Cloudflare purge_cache API
 *
 * Required environment variables:
 * - CACHE_INVALIDATION_URL: Server endpoint URL (e.g., https://server.example.com/api/cache/invalidate)
 * - CACHE_INVALIDATION_SECRET: Shared secret for authentication
 * - CLOUDFLARE_ZONE_ID: Cloudflare zone ID for CDN purging
 * - CLOUDFLARE_API_TOKEN: Cloudflare API token with Cache Purge permission
 * - WEB_URL: Public website URL (e.g., https://www.example.com)
 */

/**
 * Maps collection/global slugs to affected page paths for CDN invalidation
 */
const CDN_INVALIDATION_MAP: Record<string, string[]> = {
  // Collections
  articles: ["/", "/articles"],
  "keycap-profiles": ["/", "/articles"],
  "dropshipping-websites": ["/dropshipping"],
  media: [], // Media changes don't invalidate pages directly

  // Globals
  homepage: ["/"],
  "social-networks": ["/"],
  "dropshipping-info-page": ["/dropshipping"],
  "dropshipping-sites-page": ["/dropshipping"],
};

/**
 * Invalidates server-side cache via the API endpoint
 */
async function invalidateServerCache(slug: string, id?: string | number): Promise<void> {
  const invalidationUrl = process.env.CACHE_INVALIDATION_URL;
  const invalidationSecret = process.env.CACHE_INVALIDATION_SECRET;

  if (!invalidationUrl || !invalidationSecret) {
    console.warn(
      "[cache-invalidation] Missing CACHE_INVALIDATION_URL or CACHE_INVALIDATION_SECRET env vars",
    );
    return;
  }

  try {
    const response = await fetch(invalidationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${invalidationSecret}`,
      },
      body: JSON.stringify({
        type: slug in CDN_INVALIDATION_MAP ? "collection" : "global",
        slug,
        id: id?.toString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[cache-invalidation] Server cache invalidation failed: ${response.status} - ${errorText}`,
      );
    } else {
      console.log(`[cache-invalidation] Server cache invalidated for ${slug}`);
    }
  } catch (error) {
    console.error("[cache-invalidation] Failed to invalidate server cache:", error);
  }
}

/**
 * Invalidates Cloudflare CDN cache for affected pages
 */
async function invalidateCDNCache(slug: string): Promise<void> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const webUrl = process.env.WEB_URL;

  if (!zoneId || !apiToken || !webUrl) {
    console.warn(
      "[cache-invalidation] Missing Cloudflare env vars (CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_TOKEN, WEB_URL)",
    );
    return;
  }

  const paths = CDN_INVALIDATION_MAP[slug];
  if (!paths || paths.length === 0) {
    console.log(`[cache-invalidation] No CDN paths to invalidate for ${slug}`);
    return;
  }

  // Build full URLs for purging
  const urls = paths.map((path) => `${webUrl}${path}`);

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: urls }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[cache-invalidation] Cloudflare purge failed:", JSON.stringify(errorData));
    } else {
      console.log(`[cache-invalidation] CDN cache purged for ${slug}: ${urls.join(", ")}`);
    }
  } catch (error) {
    console.error("[cache-invalidation] Failed to purge CDN cache:", error);
  }
}

/**
 * Main cache invalidation function
 * Invalidates both server cache and CDN cache in parallel
 */
async function invalidateAllCaches(slug: string, id?: string | number): Promise<void> {
  console.log(`[cache-invalidation] Triggered for ${slug}${id ? ` (id: ${id})` : ""}`);

  await Promise.all([invalidateServerCache(slug, id), invalidateCDNCache(slug)]);
}

/**
 * Hook for collection afterChange events
 * Triggers cache invalidation when a document is created or updated
 *
 * Uses non-blocking (fire-and-forget) pattern - doesn't return a Promise
 * so Payload won't wait for invalidation to complete
 */
export const collectionAfterChangeHook: CollectionAfterChangeHook = ({
  collection,
  doc,
  operation,
}) => {
  console.log(`[cache-invalidation] Collection ${collection.slug} ${operation}: ${doc.id}`);

  // Fire and forget - don't block the response
  void invalidateAllCaches(collection.slug, doc.id);

  return doc;
};

/**
 * Hook for collection afterDelete events
 * Triggers cache invalidation when a document is deleted
 *
 * Uses non-blocking (fire-and-forget) pattern
 */
export const collectionAfterDeleteHook: CollectionAfterDeleteHook = ({ collection, doc }) => {
  console.log(`[cache-invalidation] Collection ${collection.slug} deleted: ${doc.id}`);

  // Fire and forget - don't block the response
  void invalidateAllCaches(collection.slug, doc.id);

  return doc;
};

/**
 * Hook for global afterChange events
 * Triggers cache invalidation when a global is updated
 *
 * Uses non-blocking (fire-and-forget) pattern
 */
export const globalAfterChangeHook: GlobalAfterChangeHook = ({ global, doc }) => {
  console.log(`[cache-invalidation] Global ${global.slug} updated`);

  // Fire and forget - don't block the response
  void invalidateAllCaches(global.slug);

  return doc;
};
