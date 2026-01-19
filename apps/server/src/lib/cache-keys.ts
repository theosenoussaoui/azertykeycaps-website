import type { CacheInvalidationPayload } from "@azertykeycaps-app/schemas";

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

export function buildUrlsToPurge(
  webUrl: string,
  payload: CacheInvalidationPayload,
): string[] {
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
          for (const relatedSlug of relatedArticleSlugs) {
            urls.push(`${webUrl}/articles/${relatedSlug}`);
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
