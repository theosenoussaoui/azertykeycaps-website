# Cache System Documentation

## Quick Summary

- **Browser caching**: 5 minutes fresh, 1 hour stale-while-revalidate
- **CDN caching**: 24 hours fresh, 7 days stale-while-revalidate (via `CDN-Cache-Control`)
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

We use a **split caching strategy** with separate headers for browsers and CDN:

#### Browser Cache (`Cache-Control`)

| Setting                  | Value         | Meaning                                            |
| ------------------------ | ------------- | -------------------------------------------------- |
| `max-age`                | 300 (5 min)   | Browser considers content fresh for 5 minutes      |
| `stale-while-revalidate` | 3600 (1 hour) | Serve stale content while refreshing in background |

#### CDN Cache (`CDN-Cache-Control`)

| Setting                  | Value            | Meaning                                          |
| ------------------------ | ---------------- | ------------------------------------------------ |
| `max-age`                | 86400 (24 hours) | CDN considers content fresh for 24 hours         |
| `stale-while-revalidate` | 604800 (7 days)  | CDN serves stale during origin issues for 7 days |

#### Why This Split Strategy?

1. **Users get fresh content**: 5-minute browser cache means users see updates within minutes
2. **Origin load is minimal**: 24-hour CDN cache dramatically reduces requests to origin
3. **Instant invalidation**: Cache-tags allow immediate purge when content changes in CMS
4. **Resilience**: 7-day stale-while-revalidate means the site stays up even during origin issues

The `CDN-Cache-Control` header is Cloudflare-specific and **overrides** the standard `Cache-Control` for edge caching while leaving browser caching unchanged.

#### Cloudflare Workers ISR Configuration

TanStack Start uses standard HTTP cache headers that Cloudflare respects for edge caching:

```typescript
// Cache-Control with s-maxage for CDN caching
"Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=3600"

// Cloudflare-specific header for additional control
"CDN-Cache-Control": "max-age=86400, stale-while-revalidate=604800"
```

**How it works:**

1. `max-age=300` → Browser caches for 5 minutes
2. `s-maxage=86400` → CDN caches for 24 hours (standard HTTP shared cache directive)
3. `CDN-Cache-Control` → Cloudflare-specific override with extended stale-while-revalidate
4. `Cache-Tag` → Enables surgical cache purging when CMS content changes

**Verify caching is working:**

```bash
curl -I https://www.azertykeycaps.fr/

# Look for:
# cf-cache-status: HIT    (served from CDN cache)
# cf-cache-status: MISS   (first request, fetched from origin)
# age: 123                (seconds since cached)
```

@see https://tanstack.com/start/latest/docs/framework/react/hosting#cloudflare-workers

### Layer 2: Workers Cache API (Media)

- Media files proxied from CMS are cached for 7 days
- Invalidated when media is updated in CMS

### Layer 2b: Page Data Cache (Aggregated Endpoints)

The `/api/pages/*` endpoints aggregate multiple tRPC calls into single requests for performance optimization. Instead of making multiple HTTP calls from the Web Worker to the Server Worker, these endpoints fetch all required CMS data in parallel with a single request.

| Endpoint                   | Data Included                          | Cache Strategy            | Cache Name        |
| -------------------------- | -------------------------------------- | ------------------------- | ----------------- |
| `/api/pages/layout`        | socialNetworks, profiles, notFoundPage | Always cached (24 hours)  | `page-data-cache` |
| `/api/pages/home`          | latest articles (4), homepage content  | Always cached (24 hours)  | `page-data-cache` |
| `/api/pages/article/:slug` | article (full), relatedArticles (4)    | Always cached (24 hours)  | `page-data-cache` |
| `/api/pages/profile/:slug` | profile (full), articles (paginated)   | **Base URL only** (below) | `page-data-cache` |

These endpoints use the Cloudflare Workers Cache API (via Hono cache middleware) with the same invalidation strategy as tRPC endpoints.

#### Profile Endpoint Cache Strategy

The profile endpoint supports query params for filtering and pagination:

```
GET /api/pages/profile/:slug?page=1&status=in_stock&material=pbt_double_shot&isNew=true&search=foo
```

**Cache behavior:**

- **Base requests** (no filters, page 1): Cached for 24 hours
- **Filtered/paginated requests**: Bypass cache, go directly to origin

This ensures fresh content for filtered views while still caching the most common requests (unfiltered first page).

```typescript
// Cache condition (from apps/server/src/middleware/cache.ts)
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
};
```

#### Performance Benefits

| Metric                     | Before (tRPC)      | After (Page Data) |
| -------------------------- | ------------------ | ----------------- |
| HTTP calls from Web Worker | 2 sequential       | 1 request         |
| CMS calls per request      | Sequential batches | Fully parallel    |
| Data structure             | Generic tRPC       | Page-optimized    |

The main performance win is ensuring **all CMS calls within each request are truly parallel**, eliminating tRPC batching overhead and reducing total response time.

#### Cache Invalidation

The page data cache is invalidated alongside tRPC cache when content changes:

| Content Change  | Static Endpoints Invalidated           | Dynamic Endpoints Invalidated                                         |
| --------------- | -------------------------------------- | --------------------------------------------------------------------- |
| social-networks | `/api/pages/layout`                    | -                                                                     |
| keycap-profiles | `/api/pages/layout`, `/api/pages/home` | `/api/pages/profile/:profileSlug`                                     |
| not-found-page  | `/api/pages/layout`                    | -                                                                     |
| articles        | `/api/pages/home`                      | `/api/pages/article/:articleSlug`, profile pages (current & previous) |
| homepage        | `/api/pages/home`                      | -                                                                     |

**Profile change detection:** When an article's profile changes (e.g., moved from "cherry" to "sa"), both the old and new profile pages are invalidated. The CMS hook uses Payload's `previousDoc` to detect this change and sends `previousProfileSlug` in the invalidation payload.

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

| Content Change          | Tags Purged                                                                                   | Pages Affected                                           |
| ----------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Article created/updated | `global:homepage`, `article:{slug}`, `profile:{profileSlug}`, `profile:{previousProfileSlug}` | Homepage, article page, current & previous profile pages |
| Profile updated         | `global:homepage`, `profile:{slug}`, `profile-articles:{slug}`                                | Homepage, profile page, all profile's articles           |
| Homepage global         | `global:homepage`                                                                             | Homepage only                                            |
| About page global       | `global:about`                                                                                | About page only                                          |
| Social networks         | `page:all`                                                                                    | ALL pages (footer is everywhere)                         |

**Note:** When an article's profile changes, both `profile:{profileSlug}` (new) and `profile:{previousProfileSlug}` (old) are purged to ensure both profile pages show correct article counts.

## Cache Invalidation Flow

```
CMS Content Changed
        |
        v
+------------------+
| Payload Hook     |  afterChange / afterDelete
| (uses previousDoc to detect profile changes)
+------------------+
        |
        | POST /api/cache/invalidate
        | {
        |   type: "collection",
        |   slug: "articles",
        |   articleSlug: "foo",
        |   profileSlug: "bar",
        |   previousProfileSlug: "baz"  (if profile changed)
        | }
        v
+------------------+
| Hono Server      |
+------------------+
        |
        +---> buildCacheKeys() → tRPC endpoint URLs
        |     Workers Cache API (invalidate tRPC cache)
        |
        +---> buildPageDataCacheKeys() → static page data URLs
        |     Workers Cache API (invalidate /api/pages/layout, /api/pages/home)
        |
        +---> buildDynamicPageDataCacheKeys() → slug-based URLs
        |     Workers Cache API (invalidate /api/pages/article/:slug, /api/pages/profile/:slug)
        |
        +---> buildCacheTagsToPurge() → ["global:homepage", "article:foo", "profile:bar", "profile:baz"]
              Cloudflare API: POST /purge_cache { tags: [...] }
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

| File                                       | Purpose                                                      |
| ------------------------------------------ | ------------------------------------------------------------ |
| `apps/web/src/lib/cache-tags.ts`           | `buildCacheHeaders()` utility for routes                     |
| `apps/web/src/routes/_app/*.tsx`           | Routes with `headers()` returning cache tags                 |
| `apps/web/src/features/pages/api/*.ts`     | Server functions for page data endpoints                     |
| `apps/server/src/middleware/cache.ts`      | Cache middleware factory with route-specific strategies      |
| `apps/server/src/lib/cache-keys.ts`        | `buildCacheTagsToPurge()`, `buildDynamicPageDataCacheKeys()` |
| `apps/server/src/routes/pages/layout.ts`   | Aggregated layout data endpoint                              |
| `apps/server/src/routes/pages/home.ts`     | Aggregated homepage data endpoint                            |
| `apps/server/src/routes/pages/article.ts`  | Aggregated article detail data endpoint                      |
| `apps/server/src/routes/pages/profile.ts`  | Aggregated profile page data endpoint (with query params)    |
| `apps/server/src/services/cloudflare.ts`   | `purgeCloudflareCDNByTags()` API call                        |
| `apps/server/src/routes/cache.ts`          | `/api/cache/invalidate` endpoint                             |
| `apps/cms/src/hooks/cache-invalidation.ts` | Payload CMS hooks (with `previousDoc` support)               |
| `packages/schemas/src/filters.ts`          | `profilePageQueryParamsSchema` for Hono validation           |
| `packages/schemas/src/responses.ts`        | `ArticlePageDataResponse`, `ProfilePageDataResponse`         |
| `packages/utils/src/date.ts`               | Shared date formatting utility                               |

## Adding Cache Tags to New Routes

```typescript
// apps/web/src/routes/_app/new-page.tsx
import { buildCacheHeaders } from "@/lib/cache-tags";

export const Route = createFileRoute("/_app/new-page")({
  loader: async () => {
    // ... fetch data
  },
  // Uses defaults: 5min browser, 24h CDN
  headers: () => buildCacheHeaders({ global: ["homepage"] }),

  // With dynamic tags:
  headers: ({ loaderData }) =>
    buildCacheHeaders({
      articleSlug: loaderData?.article?.slug,
      profileArticlesSlug: loaderData?.article?.profile?.slug,
    }),

  // With custom cache times (e.g., for frequently changing content):
  headers: () =>
    buildCacheHeaders(
      { global: ["homepage"] },
      {
        cacheControl: "public, max-age=60, stale-while-revalidate=300",
        cdnCacheControl: "max-age=300, stale-while-revalidate=3600",
      },
    ),
});
```

## Adding New Content Types

1. Add new tag pattern to `apps/web/src/lib/cache-tags.ts`
2. Update routes to use the new tag
3. Add purge logic to `apps/server/src/lib/cache-keys.ts` in `buildCacheTagsToPurge()`
4. Update CMS hooks if needed in `apps/cms/src/hooks/cache-invalidation.ts`

## CDN-Specific Headers Reference

### Cloudflare

| Header              | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `CDN-Cache-Control` | Overrides `Cache-Control` for edge caching only |
| `Cache-Tag`         | Tags for surgical cache purging (Pro plan+)     |
| `cf-cache-status`   | Response header showing HIT/MISS/EXPIRED status |

### Header Priority (Cloudflare)

1. `CDN-Cache-Control` (if present, used for edge)
2. `Surrogate-Control` (legacy, not used)
3. `Cache-Control` with `s-maxage` (shared cache directive)
4. `Cache-Control` with `max-age` (fallback)

Our setup uses `CDN-Cache-Control` for explicit CDN control while keeping `Cache-Control` simple for browsers.
