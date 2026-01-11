# Payload CMS App

Headless CMS with auto-generated admin panel. French default language.

## Tech Stack

- **Payload CMS** 3.x (Next.js-based)
- **Database**: SQLite (local) / Turso (production)
- **Storage**: Local filesystem (dev) / Vercel Blob (production)
- **Admin URL**: http://localhost:3002/admin

## File Structure

```
src/
  payload.config.ts       # Main config (i18n, collections, globals, db, plugins)
  payload-types.ts        # Auto-generated TypeScript types
  collections/
    Users.ts              # Admin users
    Media.ts              # Image uploads
    Articles.ts           # Keycap articles/products
    KeycapProfiles.ts     # Cherry, SA, DSA, etc.
    DropshippingWebsites.ts
  globals/
    Homepage.ts
    SocialNetworks.ts
    DropshippingInfoPage.ts
    DropshippingSitesPage.ts
```

## Collections

### Articles

Main content type for keycap products.

| Field             | Type                          | Notes                                         |
| ----------------- | ----------------------------- | --------------------------------------------- |
| title             | text                          | Required                                      |
| slug              | text                          | Auto-generated from title                     |
| img               | upload (Media)                | Required, main image                          |
| profile           | relationship (KeycapProfiles) | Optional                                      |
| material          | select                        | Values from `ARTICLE_MATERIAL_VALUES`         |
| description       | textarea                      | Optional                                      |
| status            | select                        | Required, values from `ARTICLE_STATUS_VALUES` |
| startDate/endDate | date                          | For group buys                                |
| url               | text                          | Required, product link                        |
| additionalUrl     | text                          | Optional                                      |
| affiliateUrl      | text                          | Optional                                      |
| warningText       | text                          | Optional                                      |
| isNew             | checkbox                      | Default false                                 |

### KeycapProfiles

Reference data for keycap shapes (Cherry, SA, DSA, etc.)

| Field  | Type           | Notes                        |
| ------ | -------------- | ---------------------------- |
| title  | text           | Required                     |
| slug   | text           | Auto-generated               |
| shape  | select         | Values from `PROFILE_SHAPES` |
| height | number         | In mm                        |
| img    | upload (Media) | Optional                     |

### DropshippingWebsites

Directory of keycap vendors.

| Field       | Type           | Notes                            |
| ----------- | -------------- | -------------------------------- |
| title       | text           | Required                         |
| slug        | text           | Auto-generated                   |
| url         | text           | Required                         |
| description | textarea       | Optional                         |
| category    | select         | Values from `WEBSITE_CATEGORIES` |
| img         | upload (Media) | Optional                         |

## Globals

- **Homepage**: Hero content, featured articles
- **SocialNetworks**: Discord, Instagram, Twitter links
- **DropshippingInfoPage**: Info page content
- **DropshippingSitesPage**: Sites directory page content

## i18n Configuration

```typescript
i18n: {
  supportedLanguages: { fr, en },
  fallbackLanguage: 'fr',
}
```

Admin panel available in French and English. French is default.

## Commands

```bash
# Development (from root)
bun run dev:cms

# Generate TypeScript types
cd apps/cms && bun run generate:types

# Open Payload admin
http://localhost:3002/admin
```

## REST API

Payload auto-generates REST endpoints:

```
GET  /api/articles              # List articles
GET  /api/articles?where[slug][equals]=xxx  # Find by slug
GET  /api/keycap-profiles       # List profiles
GET  /api/media/:id             # Get media file
GET  /api/globals/homepage      # Get homepage global
```

Query params:

- `limit` - Page size
- `page` - Page number
- `depth` - Populate relationships (0-3)
- `where` - Filter conditions (JSON)
- `sort` - Sort field (prefix `-` for desc)

## Environment Variables

```bash
PAYLOAD_SECRET=          # Required, min 32 chars
DATABASE_URL=            # SQLite connection string
DATABASE_AUTH_TOKEN=     # Turso auth token (production)
BLOB_READ_WRITE_TOKEN=   # Vercel Blob token (production)
```

## Schema Constants

Collections import constants from `@azertykeycaps-app/schemas`:

```typescript
import {
  ARTICLE_STATUS_VALUES,
  ARTICLE_MATERIAL_VALUES,
  PROFILE_SHAPES,
  WEBSITE_CATEGORIES,
} from "@azertykeycaps-app/schemas";
```

This ensures consistency between CMS select options and API validation.

## Adding New Collections

1. Create file in `src/collections/`
2. Define fields using Payload schema
3. Import constants from `@azertykeycaps-app/schemas` if needed
4. Add to `payload.config.ts` collections array
5. Run `bun run generate:types` to update types
6. Add corresponding Zod schema in `packages/schemas`
