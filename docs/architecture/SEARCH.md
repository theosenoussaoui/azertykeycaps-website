# Search Architecture

This document describes the search functionality implementation, including the Payload CMS Search Plugin, tRPC API, and client-side command palette.

## Overview

The search feature allows users to search for keycap profiles and articles (keysets) across the site. It uses:

- **Payload CMS Search Plugin** - Server-side indexing and full-text search
- **tRPC** - Type-safe API layer for search queries
- **Command Palette (Cmd+K)** - Client-side UI using Base UI Autocomplete

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web App       │     │   Server (API)  │     │   CMS           │
│                 │     │                 │     │                 │
│  SearchCommand  │────▶│  tRPC Router    │────▶│  /api/search    │
│  (React Query)  │     │  search.query   │     │  (Payload)      │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Payload Search Plugin Configuration

**File:** `apps/cms/src/payload.config.ts`

```typescript
searchPlugin({
  collections: ["articles", "keycap-profiles"],
  defaultPriorities: {
    articles: 10,
    "keycap-profiles": 20, // Profiles appear first
  },
  // Store slug for navigation
  beforeSync: ({ originalDoc, searchDoc }) => ({
    ...searchDoc,
    slug: originalDoc.slug,
  }),
  // Add slug field to search collection
  searchOverrides: {
    fields: ({ defaultFields }) => [
      ...defaultFields,
      { name: "slug", type: "text", index: true },
    ],
  },
}),
```

### How Indexing Works

1. **Automatic Sync**: When a document is created/updated in `articles` or `keycap-profiles`, the search plugin automatically creates/updates a record in the `search` collection.

2. **Title Field**: The plugin uses `admin.useAsTitle` from each collection to determine which field to index as the searchable title.

3. **Custom Fields**: The `beforeSync` hook copies the `slug` field to enable navigation from search results.

4. **Priority**: Higher priority values appear first in results (profiles > articles).

### Search Collection Schema

The plugin creates a `search` collection with:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Auto-generated ID (D1/SQLite) |
| `title` | string | Searchable title from source document |
| `slug` | string | URL slug (added via `beforeSync`) |
| `priority` | number | Sort priority |
| `doc` | object | Reference to source document |
| `doc.relationTo` | string | Collection name (`articles` or `keycap-profiles`) |
| `doc.value` | number | Source document ID |

## tRPC Search Router

**File:** `packages/api/src/routers/search.ts`

```typescript
export const searchRouter = router({
  query: publicProcedure
    .input(searchInputSchema)
    .output(searchResponseSchema)
    .query(async ({ ctx, input }) => {
      const { q, limit } = input;
      
      const queryString = stringify({
        where: { title: { contains: q } },
        limit,
        depth: 0,
        sort: "-priority",
      }, { addQueryPrefix: true });

      const response = await fetch(
        `${ctx.env.CMS_API_URL}/api/search${queryString}`,
        { headers: { Authorization: `users API-Key ${ctx.env.CMS_API_KEY}` } }
      );
      
      // ... validation and return
    }),
});
```

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| `q` | Search query (min 1, max 100 chars) |
| `limit` | Max results (1-20, default 10) |

### Response Format

```typescript
{
  docs: SearchResult[],
  totalDocs: number,
  hasNextPage: boolean,
}
```

## Schema Definitions

**File:** `packages/schemas/src/search.ts`

```typescript
import { payloadIdSchema } from "./common";

export const searchResultSchema = z.object({
  id: payloadIdSchema,           // Coerced to string
  title: z.string(),
  slug: z.string(),
  priority: z.number().optional(),
  doc: z.object({
    relationTo: z.enum(["articles", "keycap-profiles"]),
    value: payloadIdSchema,      // Coerced to string
  }),
});
```

## Client-Side Implementation

**File:** `apps/web/src/components/search-command.tsx`

### Key Features

1. **Keyboard Shortcut**: Opens with `Ctrl/Cmd + K`
2. **Debounced Search**: 300ms debounce to avoid excessive API calls
3. **Default View**: Shows profiles when opened (no search query)
4. **Grouped Results**: Separates profiles and articles in results
5. **Navigation**: Uses TanStack Router `<Link>` for client-side navigation

### State Management

```typescript
const [open, setOpen] = useState(false);
const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 300);

const searchQuery = useQuery({
  ...trpc.search.query.queryOptions({ q: debouncedQuery, limit: 10 }),
  enabled: isSearching && open,  // Only fetch when dialog is open
  staleTime: 30_000,             // Cache for 30 seconds
});
```

### Navigation Paths

| Collection | Route |
|------------|-------|
| `keycap-profiles` | `/profile/{slug}` |
| `articles` | `/articles/{slug}` |

## Common Pitfalls & Traps

### 1. Numeric vs String IDs

**Problem:** Payload with D1/SQLite returns numeric IDs, but the app expects strings.

**Solution:** Use `z.coerce.string()` via `payloadIdSchema` for all ID fields.

```typescript
// packages/schemas/src/common.ts
export const payloadIdSchema = z.coerce.string();
```

### 2. Re-indexing After Plugin Changes

**Problem:** Existing documents aren't automatically re-indexed when search config changes.

**Solution:** Re-save documents in CMS admin or run a migration script:

```typescript
// Example: Re-index all articles
const articles = await payload.find({ collection: "articles", limit: 1000 });
for (const article of articles.docs) {
  await payload.update({
    collection: "articles",
    id: article.id,
    data: article,
  });
}
```

### 3. Search Collection Access Control

**Problem:** Search collection inherits default access control (authenticated only).

**Solution:** The tRPC router uses `CMS_API_KEY` for authentication. Ensure this is set in environment variables.

### 4. Missing Slug in Search Results

**Problem:** Navigation fails if `slug` field isn't in search records.

**Solution:** The `beforeSync` hook must copy the slug:

```typescript
beforeSync: ({ originalDoc, searchDoc }) => ({
  ...searchDoc,
  slug: originalDoc.slug,
}),
```

### 5. Title Field Not Indexed

**Problem:** New collection's title field isn't being indexed.

**Solution:** Ensure `admin.useAsTitle` is set on the collection:

```typescript
export const MyCollection: CollectionConfig = {
  admin: {
    useAsTitle: "title",  // Required for search indexing
  },
  // ...
};
```

### 6. Command Palette Not Updating

**Problem:** Search results don't update when typing.

**Solution:** Check:
- `useDebounce` hook is working (300ms delay expected)
- `enabled` condition includes `open` state
- `debouncedQuery.length >= 2` (minimum search length)

### 7. Dialog Closes on Navigation

**Problem:** Dialog doesn't close after clicking a result.

**Solution:** Call `closeDialog()` in the Link's `onClick`:

```tsx
<Link to={path} onClick={closeDialog} />
```

## Environment Variables

| Variable | Description | Used By |
|----------|-------------|---------|
| `CMS_API_URL` | Payload CMS base URL | Server (tRPC) |
| `CMS_API_KEY` | API key for CMS authentication | Server (tRPC) |

## File Structure

```
packages/
  api/src/routers/
    search.ts           # tRPC search procedure
  schemas/src/
    common.ts           # payloadIdSchema
    search.ts           # Search Zod schemas

apps/
  cms/src/
    payload.config.ts   # Search plugin config
  web/src/
    components/
      search-command.tsx    # Command palette UI
    hooks/
      use-debounce.ts       # Debounce hook
    lib/
      trpc.ts               # tRPC client context
```

## Adding a New Collection to Search

1. **Add to plugin config:**
   ```typescript
   searchPlugin({
     collections: ["articles", "keycap-profiles", "new-collection"],
     defaultPriorities: {
       "new-collection": 5,
     },
   })
   ```

2. **Ensure `useAsTitle` is set:**
   ```typescript
   export const NewCollection: CollectionConfig = {
     admin: { useAsTitle: "name" },
   };
   ```

3. **Update schema enum:**
   ```typescript
   // packages/schemas/src/search.ts
   doc: z.object({
     relationTo: z.enum(["articles", "keycap-profiles", "new-collection"]),
   }),
   ```

4. **Update navigation paths:**
   ```typescript
   // apps/web/src/components/search-command.tsx
   const getResultPath = (result: SearchResult) => {
     if (result.doc.relationTo === "new-collection") {
       return `/new-collection/${result.slug}`;
     }
     // ...
   };
   ```

5. **Re-index existing documents** (if any).

## Performance Considerations

- **Debouncing:** 300ms delay prevents excessive API calls while typing
- **Stale Time:** 30 seconds cache prevents refetching for repeated queries
- **Enabled Condition:** Only fetches when dialog is open AND query is valid
- **Limit:** Default 10 results to minimize response size
- **Depth 0:** No nested relationship population to speed up queries

## Testing Search

1. **Manual Testing:**
   - Open with `Ctrl+K`
   - Type a known article/profile title
   - Verify results appear
   - Click result and verify navigation

2. **Check CMS Search Collection:**
   - Go to CMS admin → Search
   - Verify documents are indexed
   - Check `slug` field is populated

3. **Debug API:**
   ```bash
   curl "${CMS_API_URL}/api/search?where[title][contains]=cherry" \
     -H "Authorization: users API-Key ${CMS_API_KEY}"
   ```
