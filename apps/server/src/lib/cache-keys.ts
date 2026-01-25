import type { CacheInvalidationPayload } from "@azertykeycaps-app/schemas";

/**
 * Build tRPC cache keys to invalidate in Workers Cache API.
 */
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
        tags.push("global:homepage");
        // The specific article page
        if (articleSlug) {
          tags.push(`article:${articleSlug}`);
        }
        // Profile page that lists this article
        if (profileSlug) {
          tags.push(`profile:${profileSlug}`);
        }
        break;

      case "keycap-profiles":
        // Homepage shows profiles
        tags.push("global:homepage");
        if (profileSlug) {
          // The profile page itself
          tags.push(`profile:${profileSlug}`);
          // All articles belonging to this profile
          tags.push(`profile-articles:${profileSlug}`);
        }
        break;

      case "media":
        // Media changes don't affect HTML cache
        break;
    }
  } else if (type === "global") {
    switch (slug) {
      case "homepage":
        tags.push("global:homepage");
        break;
      case "informations-page":
        tags.push("global:about");
        break;
      case "suggestion-page":
        tags.push("global:suggest");
        break;
      case "social-networks":
        // Social links are in the footer - purge ALL pages
        tags.push("page:all");
        break;
    }
  }

  return [...new Set(tags)];
}
