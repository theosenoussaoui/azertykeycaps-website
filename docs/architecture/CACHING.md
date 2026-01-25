# Cache System Documentation

## Quick Summary

- **CDN caching**: Pages cached for 5 minutes, stale content served for up to 1 hour while refreshing
- **Cache invalidation**: Uses Cloudflare cache-tags for instant, surgical purges
- **No manual URL tracking**: Pages declare their own cache tags, Cloudflare handles the rest

## Architecture Overview

```
User Request
     |
     v
+--------------------+
|  Cloudflare CDN    |  <- HTML pages cached with Cache-Tag headers
|  (Edge Cache)      |
+--------------------+
     |
     v (on cache MISS)
+--------------------+
|  TanStack Start    |  <- SSR renders page, sets Cache-Tag header
|  (Web Worker)      |
+--------------------+
     |
     v
+--------------------+
|  Hono Server       |  <- tRPC API + Media proxy
|  (API Worker)      |
+--------------------+
     |
     v
+--------------------+
|  Payload CMS       |  <- Content source
+--------------------+
```

## How Cache-Tags Work

Cache-tags solve the problem of "how do I know which pages to invalidate?"

### The Old Way (URL-based purging)

```
Article updated → Server must figure out all affected URLs:
  - /articles/gmk-dracula
  - /profile/cherry (lists this article)
  - / (shows latest articles)
  - ... what if we miss one?
```

### The New Way (Cache-tags)

```
1. When rendering, each page declares its dependencies:
   /articles/gmk-dracula → Cache-Tag: article:gmk-dracula, profile-articles:cherry
   /profile/cherry       → Cache-Tag: profile:cherry
   /                     → Cache-Tag: global:homepage

2. Cloudflare indexes these tags internally

3. When article updated, we just say:
   "Purge everything tagged with article:gmk-dracula"

4. Cloudflare finds and purges all matching pages automatically
```

**Key insight**: Pages know what they depend on. The server just needs to know what changed.

## Cache Layers

### Layer 1: Cloudflare CDN (HTML Pages)

| Setting                  | Value         | Meaning                                            |
| ------------------------ | ------------- | -------------------------------------------------- |
| `max-age`                | 300 (5 min)   | Browser considers content fresh for 5 minutes      |
| `s-maxage`               | 300 (5 min)   | CDN considers content fresh for 5 minutes          |
| `stale-while-revalidate` | 3600 (1 hour) | Serve stale content while refreshing in background |

### Layer 2: Workers Cache API (Media)

- Media files proxied from CMS are cached for 7 days
- Invalidated when media is updated in CMS

### Layer 3: TanStack Query (Client-Side)

- Loader data cached in browser memory
- `staleTime` and `gcTime` configured per route

## Cache-Tag Naming Convention

| Tag Pattern               | Description                           | Example                   |
| ------------------------- | ------------------------------------- | ------------------------- |
| `page:all`                | All pages (for footer/header changes) | Social links updated      |
| `global:homepage`         | Homepage content                      | Homepage title changed    |
| `global:about`            | About page content                    | About text updated        |
| `global:suggest`          | Suggestion page content               | Suggest page updated      |
| `article:{slug}`          | Single article page                   | `article:gmk-dracula`     |
| `profile:{slug}`          | Single profile page                   | `profile:cherry`          |
| `profile-articles:{slug}` | All articles for a profile            | `profile-articles:cherry` |

## What Gets Purged When Content Changes

| Content Change          | Tags Purged                                                    | Pages Affected                                 |
| ----------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| Article created/updated | `global:homepage`, `article:{slug}`, `profile:{profileSlug}`   | Homepage, article page, profile page           |
| Profile updated         | `global:homepage`, `profile:{slug}`, `profile-articles:{slug}` | Homepage, profile page, all profile's articles |
| Homepage global         | `global:homepage`                                              | Homepage only                                  |
| About page global       | `global:about`                                                 | About page only                                |
| Social networks         | `page:all`                                                     | ALL pages (footer is everywhere)               |

## Cache Invalidation Flow

```
CMS Content Changed
        |
        v
+------------------+
| Payload Hook     |  afterChange / afterDelete
+------------------+
        |
        | POST /api/cache/invalidate
        | { type: "collection", slug: "articles", articleSlug: "foo", profileSlug: "bar" }
        v
+------------------+
| Hono Server      |
| buildCacheTagsToPurge() → ["global:homepage", "article:foo", "profile:bar"]
+------------------+
        |
        +---> Workers Cache API (invalidate tRPC cache)
        |
        +---> Cloudflare API: POST /purge_cache { tags: [...] }
```

## Environment Variables

### CMS (apps/cms)

```bash
CACHE_INVALIDATION_URL=https://api.example.com/api/cache/invalidate
CACHE_INVALIDATION_SECRET=your-secret-token
```

### Server (apps/server)

```bash
CACHE_INVALIDATION_SECRET=your-secret-token
CF_ZONE_ID=your-cloudflare-zone-id
CF_API_TOKEN=your-cloudflare-api-token
```

## Cloudflare API Token Permissions

Create an API token with:

- **Zone**: Cache Purge (Edit)
- **Zone**: Zone (Read)

## Rate Limits (Pro Plan)

| Purge Type | Rate Limit                                  |
| ---------- | ------------------------------------------- |
| By tag     | 5 requests/second, max 100 tags per request |
| By URL     | 1500 URLs/second, max 100 URLs per request  |

Cache-tag purging is more efficient - one request can invalidate thousands of pages.

## Troubleshooting

### Check Cache Status

```bash
curl -I https://www.example.com/

# Look for:
# cf-cache-status: HIT    (served from cache)
# cf-cache-status: MISS   (fetched from origin)
# cf-cache-status: EXPIRED (cache expired, revalidating)
# age: 123                (seconds since cached)
# cache-tag: (stripped by Cloudflare before reaching you)
```

### Manual Cache Purge by Tags

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"tags":["article:gmk-dracula","global:homepage"]}'
```

### Manual Cache Purge Everything

```bash
# Use sparingly - invalidates entire site
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Common Issues

**Cache not invalidating after CMS edit:**

1. Check CMS logs for hook execution
2. Verify `CACHE_INVALIDATION_URL` and `CACHE_INVALIDATION_SECRET` are set
3. Check server logs for `/api/cache/invalidate` requests
4. Verify `CF_ZONE_ID` and `CF_API_TOKEN` are set on server

**Stale content after purge:**

1. Cloudflare purge is eventually consistent (usually < 30 seconds)
2. Browser may have local cache - try hard refresh (Ctrl+Shift+R)
3. Check `cf-cache-status` header to confirm purge happened

**High origin load:**

1. Check cache hit ratio in Cloudflare dashboard
2. Ensure Cache-Tag headers are being set (check route `headers()` function)
3. Consider increasing `max-age` if content changes infrequently

## Implementation Files

| File                                       | Purpose                                      |
| ------------------------------------------ | -------------------------------------------- |
| `apps/web/src/lib/cache-tags.ts`           | `buildCacheHeaders()` utility for routes     |
| `apps/web/src/routes/_app/*.tsx`           | Routes with `headers()` returning cache tags |
| `apps/server/src/lib/cache-keys.ts`        | `buildCacheTagsToPurge()` for invalidation   |
| `apps/server/src/services/cloudflare.ts`   | `purgeCloudflareCDNByTags()` API call        |
| `apps/server/src/routes/cache.ts`          | `/api/cache/invalidate` endpoint             |
| `apps/cms/src/hooks/cache-invalidation.ts` | Payload CMS hooks                            |

## Adding Cache Tags to New Routes

```typescript
// apps/web/src/routes/_app/new-page.tsx
import { buildCacheHeaders } from "@/lib/cache-tags";

export const Route = createFileRoute("/_app/new-page")({
  loader: async () => {
    // ... fetch data
  },
  headers: () => buildCacheHeaders({ global: ["homepage"] }),
  // or with dynamic tags:
  headers: ({ loaderData }) =>
    buildCacheHeaders({
      articleSlug: loaderData?.article?.slug,
      profileArticlesSlug: loaderData?.article?.profile?.slug,
    }),
});
```

## Adding New Content Types

1. Add new tag pattern to `apps/web/src/lib/cache-tags.ts`
2. Update routes to use the new tag
3. Add purge logic to `apps/server/src/lib/cache-keys.ts` in `buildCacheTagsToPurge()`
4. Update CMS hooks if needed in `apps/cms/src/hooks/cache-invalidation.ts`
