# Cache System Documentation

## Architecture Overview

```
User Request
     |
     v
+--------------------+
|  Cloudflare CDN    |  <- HTML pages cached (5 min TTL)
|  (Edge Cache)      |
+--------------------+
     |
     v (on cache MISS)
+--------------------+
|  TanStack Start    |  <- SSR renders page
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

## Cache Layers

### Layer 1: Cloudflare CDN (HTML Pages)

- **What's cached**: Full HTML pages from SSR
- **TTL**: 5 minutes (`max-age=300, s-maxage=300`)
- **Stale serving**: 1 hour (`stale-while-revalidate=3600`)
- **Invalidation**: On-demand URL purge via Cloudflare API

### Layer 2: Hono Cache API (Media Only)

- **What's cached**: Media files proxied from CMS
- **TTL**: 7 days
- **Location**: Cloudflare Workers Cache API
- **Endpoint**: `/api/media/*`

### Layer 3: TanStack Query (Client-Side)

- **What's cached**: Loader data in browser memory
- **TTL**: Varies by route (staleTime/gcTime)
- **Invalidation**: Automatic on navigation or manual refetch

## Cache-Control Strategy

### Route-Level Settings

| Route             | max-age | stale-while-revalidate | staleTime (client) | gcTime (client) |
| ----------------- | ------- | ---------------------- | ------------------ | --------------- |
| `/_app` (layout)  | 5 min   | 1 hour                 | 10 min             | 1 hour          |
| `/` (homepage)    | 5 min   | 1 hour                 | 1 min              | 5 min           |
| `/articles/$slug` | 5 min   | 1 hour                 | 5 min              | 30 min          |
| `/profile/$slug`  | 5 min   | 1 hour                 | 5 min              | 30 min          |
| `/about`          | 5 min   | 1 hour                 | 1 hour             | 24 hours        |
| `/suggest`        | 5 min   | 1 hour                 | 1 hour             | 24 hours        |

### How stale-while-revalidate Works

1. **Request arrives** at CDN edge
2. **Cache HIT (fresh)**: Return cached response immediately
3. **Cache HIT (stale)**: Return cached response, trigger background revalidation
4. **Cache MISS**: Fetch from origin (SSR), cache response

This ensures users always get fast responses while content stays reasonably fresh.

## Cache Invalidation Flow

```
CMS Content Change
        |
        v
+------------------+
| Payload Hook     |  <- afterChange / afterDelete
+------------------+
        |
        | POST /api/cache/invalidate
        v
+------------------+
| Hono Server      |
+------------------+
        |
        +---> Workers Cache API (invalidate tRPC cache keys)
        |
        +---> Cloudflare API (purge specific URLs)
```

### Invalidation Payload

```typescript
interface CacheInvalidationPayload {
  type: "collection" | "global";
  slug: string;
  id?: string;
  articleSlug?: string;
  profileSlug?: string;
  relatedArticleSlugs?: string[];
}
```

### Content Type to URLs Mapping

| Content Change            | URLs Purged                                           |
| ------------------------- | ----------------------------------------------------- |
| Article created/updated   | `/`, `/articles/{slug}`, `/profile/{profileSlug}`     |
| Article deleted           | `/`, `/articles/{slug}`, `/profile/{profileSlug}`     |
| Profile created/updated   | `/`, `/profile/{slug}`, all `/articles/{relatedSlug}` |
| Profile deleted           | `/`, `/profile/{slug}`                                |
| Global: informations-page | `/about`                                              |
| Global: suggestion-page   | `/suggest`                                            |
| Global: social-networks   | `/`, `/about`, `/suggest`                             |
| Global: homepage          | `/`                                                   |

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
CORS_ORIGIN=https://www.example.com
SERVER_URL=https://api.example.com
```

## Cloudflare API Token Permissions

Create an API token with:

- **Zone**: Cache Purge (Edit)
- **Zone**: Zone (Read)

## Troubleshooting

### Check Cache Status

```bash
curl -I https://www.example.com/

# Look for:
# cf-cache-status: HIT (served from cache)
# cf-cache-status: MISS (fetched from origin)
# cf-cache-status: EXPIRED (cache expired, revalidating)
# age: 123 (seconds since cached)
```

### Manual Cache Purge

```bash
# Purge specific URLs
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://www.example.com/","https://www.example.com/about"]}'

# Purge everything (use sparingly)
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
3. Check if request is hitting a different CDN edge

**High origin load:**

1. Check cache hit ratio in Cloudflare dashboard
2. Ensure Cache-Control headers are being set correctly
3. Verify routes have `headers()` function defined

## Rate Limits (Cloudflare Free Plan)

- **URL purge**: 800 URLs/second, max 100 URLs per request
- **Hostname purge**: 5 requests/minute

The current implementation uses URL purge for surgical invalidation, staying well within limits.

## Future Considerations

### Cache-Tags (Enterprise Only)

If upgrading to Cloudflare Enterprise, cache-tags enable more efficient purging:

```typescript
headers: () => ({
  "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  "Cache-Tag": "articles, profile-cherry",
})
```

Then purge by tag instead of URL:

```bash
curl -X POST ".../purge_cache" --data '{"tags":["articles"]}'
```

### API-Level Caching

Currently not implemented because CDN caching handles most cases. Consider adding if:

- Multiple CDN edges frequently revalidate simultaneously
- CMS response times are slow
- Need to reduce CMS load further
