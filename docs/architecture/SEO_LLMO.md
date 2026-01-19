# SEO & LLMO Guidelines

> **Comprehensive rules for Search Engine Optimization (SEO) and LLM Optimization (LLMO).**

## Quick Reference

| Aspect               | Requirement                                                         |
| -------------------- | ------------------------------------------------------------------- |
| **Site URL**         | `VITE_SITE_URL` env variable (required for canonical URLs, OG tags) |
| **Default OG Image** | `${VITE_SITE_URL}/og.webp` (1200x630px)                             |
| **Favicon**          | `/favicon.ico` + `/apple-touch-icon.png` (180x180)                  |
| **Theme Color**      | `#1e1e1e` (matches dark mode background)                            |
| **Language**         | `lang="fr"` on `<html>` element                                     |
| **Sitemap**          | Dynamic at `/sitemap.xml` (fetches from CMS)                        |
| **Robots**           | Dynamic at `/robots.txt`                                            |
| **LLMO**             | `/llms.txt` for AI assistants                                       |

---

## SEO Checklist for Routes

Every route MUST have these meta tags in its `head` function:

### Required Meta Tags

```tsx
head: ({ loaderData }) => ({
  meta: [
    // 1. Title (unique per page, max 60 chars)
    { title: "Page Title - Azertykeycaps" },

    // 2. Description (unique per page, 150-160 chars)
    { name: "description", content: "Page description here..." },

    // 3. Open Graph (social sharing)
    { property: "og:title", content: "Page Title" },
    { property: "og:description", content: "Page description here..." },
    { property: "og:image", content: `${siteUrl}/og.webp` },
    { property: "og:url", content: `${siteUrl}/page-path` },
    { property: "og:type", content: "website" }, // or "article" for articles
    { property: "og:site_name", content: "Azertykeycaps" },
    { property: "og:locale", content: "fr_FR" },

    // 4. Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Page Title" },
    { name: "twitter:description", content: "Page description here..." },
    { name: "twitter:image", content: `${siteUrl}/og.webp` },
  ],
  links: [
    // 5. Canonical URL (prevents duplicate content)
    { rel: "canonical", href: `${siteUrl}/page-path` },
  ],
});
```

### Page Type Mapping

| Page Type      | `og:type` | JSON-LD Type                  |
| -------------- | --------- | ----------------------------- |
| Home           | `website` | `WebSite` + `ItemList`        |
| Article Detail | `article` | `Article`                     |
| Profile/List   | `website` | `CollectionPage` + `ItemList` |
| About          | `website` | `AboutPage`                   |
| Generic        | `website` | `WebPage`                     |

---

## JSON-LD Structured Data

Every page MUST include appropriate JSON-LD structured data in the `head` function's `scripts` array.

### WebSite Schema (Root Only)

Applied in `__root.tsx` for site-wide context:

```tsx
scripts: [
  {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Azertykeycaps",
      url: siteUrl,
      description: "Annuaire de keysets compatibles AZERTY",
      inLanguage: "fr",
      publisher: {
        "@type": "Organization",
        name: "Azertykeycaps",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
        },
      },
    }),
  },
];
```

### Article Schema

For article detail pages (`/articles/$slug`):

```tsx
scripts: [
  {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      image: article.img.url,
      url: `${siteUrl}/articles/${article.slug}`,
      datePublished: article.createdAt,
      dateModified: article.updatedAt,
      author: {
        "@type": "Organization",
        name: "Azertykeycaps",
      },
      publisher: {
        "@type": "Organization",
        name: "Azertykeycaps",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${siteUrl}/articles/${article.slug}`,
      },
    }),
  },
];
```

### ItemList Schema

For list pages (home, profile):

```tsx
scripts: [
  {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/articles/${article.slug}`,
        name: article.title,
      })),
    }),
  },
];
```

### Product Schema (Optional)

For keyset articles with pricing information:

```tsx
{
  "@context": "https://schema.org",
  "@type": "Product",
  name: article.title,
  description: article.description,
  image: article.img.url,
  brand: {
    "@type": "Brand",
    name: article.designer || "Unknown",
  },
  offers: {
    "@type": "Offer",
    availability: getSchemaAvailability(article.status),
    url: article.affiliateLink,
  },
}

// Helper function
function getSchemaAvailability(status: string): string {
  switch (status) {
    case "in_stock":
    case "extras_in_stock":
      return "https://schema.org/InStock";
    case "out_of_stock":
    case "gb_ended":
      return "https://schema.org/OutOfStock";
    case "gb_running":
    case "interest_check":
      return "https://schema.org/PreOrder";
    default:
      return "https://schema.org/OutOfStock";
  }
}
```

---

## SEO Utility Functions

Use `apps/web/src/lib/seo.ts` for consistent SEO implementation:

```tsx
import { env } from "@azertykeycaps-app/env/web";

const siteUrl = env.VITE_SITE_URL;
const siteName = "Azertykeycaps";
const defaultOgImage = `${siteUrl}/og-image.png`;

// Generate standard meta tags
export function generateMeta({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}) {
  const fullTitle = `${title} - ${siteName}`;
  const url = `${siteUrl}${path}`;
  const ogImage = image || defaultOgImage;

  return [
    { title: fullTitle },
    { name: "description", content: description },
    // Open Graph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:site_name", content: siteName },
    { property: "og:locale", content: "fr_FR" },
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];
}

// Generate canonical link
export function generateCanonical(path: string) {
  return { rel: "canonical", href: `${siteUrl}${path}` };
}

// Generate JSON-LD script tag
export function generateJsonLd(data: object) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}
```

---

## LLMO (LLM Optimization) Guidelines

### What is LLMO?

LLM Optimization ensures AI assistants (ChatGPT, Claude, Perplexity, etc.) can accurately understand and cite your content.

### Required Files

#### `/llms.txt`

A machine-readable file for AI assistants:

```text
# Azertykeycaps

> Azertykeycaps is a French directory of AZERTY-compatible mechanical keyboard keycap sets.

## About
Azertykeycaps helps French keyboard enthusiasts discover keycap sets that support the AZERTY layout. We catalog keysets by profile, material, and availability status.

## Key Facts
- Language: French (fr)
- Focus: AZERTY-compatible keycap sets
- Categories: Keycap profiles (Cherry, SA, DSA, etc.)
- Content: Product listings with status, materials, pricing

## Pages
- Home: ${siteUrl}/
- About: ${siteUrl}/about
- Profiles: ${siteUrl}/profile/[slug]
- Articles: ${siteUrl}/articles/[slug]

## API
- Sitemap: ${siteUrl}/sitemap.xml
- Robots: ${siteUrl}/robots.txt

## Contact
- Website: ${siteUrl}
```

### Content Best Practices for LLMO

#### 1. Clear, Factual Statements

Write content that AI can extract facts from:

```tsx
// Good: Clear, extractable facts
<p>
  {article.title} is a {article.profile.title} profile keyset
  made of {article.material}. It is currently {article.status}.
</p>

// Bad: Vague, marketing-speak
<p>
  This amazing keyset will transform your typing experience!
</p>
```

#### 2. Hierarchical Structure

Use proper heading hierarchy:

```tsx
<article>
  <h1>{article.title}</h1> // One h1 per page
  <section>
    <h2>Specifications</h2> // Major sections
    <h3>Materials</h3> // Subsections
  </section>
</article>
```

#### 3. Structured Data

JSON-LD is critical for LLMO - AI systems extract structured information from it.

#### 4. Semantic HTML

Use semantic elements that convey meaning:

```tsx
<article>         // Self-contained content
<nav>             // Navigation
<time dateTime>   // Dates
<dl><dt><dd>      // Key-value pairs (specifications)
<figure>          // Images with captions
```

---

## Technical SEO

### Performance Requirements

| Metric | Target  | Why                  |
| ------ | ------- | -------------------- |
| LCP    | < 2.5s  | Core Web Vital       |
| FID    | < 100ms | Core Web Vital       |
| CLS    | < 0.1   | Core Web Vital       |
| TTFB   | < 600ms | Server response time |

### Image Optimization

```tsx
// Above-fold images (hero, first article)
<img
  src={image.url}
  alt={image.alt}                    // Always provide alt text
  loading="eager"                    // Don't lazy-load above fold
  fetchPriority="high"               // Prioritize loading
  width={1200}                       // Always set dimensions
  height={630}
/>

// Below-fold images
<img
  src={image.url}
  alt={image.alt}
  loading="lazy"                     // Lazy load
  decoding="async"                   // Non-blocking decode
/>
```

### Preloading Critical Assets

In route `head` function:

```tsx
links: [
  // Preload hero image
  {
    rel: "preload",
    as: "image",
    href: heroImageUrl,
  },
];
```

### Canonical URLs

**Always use canonical URLs to prevent duplicate content:**

- `/profile/cherry?page=1` canonicalizes to `/profile/cherry`
- Pagination: `/profile/cherry?page=2` keeps `page` param
- Filters: Strip filter params from canonical

```tsx
// Get canonical path (strips filters, keeps pagination if > 1)
function getCanonicalPath(path: string, page?: number): string {
  if (page && page > 1) {
    return `${path}?page=${page}`;
  }
  return path;
}
```

---

## Sitemap Guidelines

### Dynamic Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>https://azertykeycaps.fr/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://azertykeycaps.fr/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Dynamic pages from CMS -->
  <url>
    <loc>https://azertykeycaps.fr/articles/gmk-frost-witch</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Priority Guidelines

| Page Type      | Priority | Change Frequency |
| -------------- | -------- | ---------------- |
| Home           | 1.0      | daily            |
| Article Detail | 0.8      | weekly           |
| Profile List   | 0.7      | daily            |
| About          | 0.5      | monthly          |
| Suggest        | 0.3      | monthly          |

---

## robots.txt Guidelines

```txt
# Azertykeycaps Robots.txt

User-agent: *
Allow: /

# Private routes
Disallow: /dashboard
Disallow: /login
Disallow: /api/

# Sitemap
Sitemap: https://azertykeycaps.fr/sitemap.xml
```

### Crawler-Specific Rules

```txt
# Allow all major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# AI crawlers (for LLMO)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /
```

---

## Environment Variables

### Required for SEO

```bash
# apps/web/.env
VITE_SITE_URL=https://azertykeycaps.fr
```

### In packages/env/src/web.ts

```typescript
export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: z.url(),
    VITE_SITE_URL: z.url(), // Required for SEO
  },
  // ...
});
```

---

## Route Implementation Examples

### Home Page (`_app/index.tsx`)

```tsx
import { generateMeta, generateCanonical, generateJsonLd } from "@/lib/seo";
import { env } from "@azertykeycaps-app/env/web";

export const Route = createFileRoute("/_app/")({
  head: ({ loaderData }) => {
    const i18n = t();
    const articles = loaderData?.articles?.docs ?? [];
    const siteUrl = env.VITE_SITE_URL;

    return {
      meta: generateMeta({
        title: i18n.home.metaTitle,
        description: i18n.home.metaDescription,
        path: "/",
      }),
      links: [generateCanonical("/")],
      scripts: [
        generateJsonLd({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: articles.map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${siteUrl}/articles/${article.slug}`,
            name: article.title,
          })),
        }),
      ],
    };
  },
});
```

### Article Detail (`_app/articles.$slug.tsx`)

```tsx
export const Route = createFileRoute("/_app/articles/$slug")({
  head: ({ loaderData, params }) => {
    const article = loaderData?.article;
    const siteUrl = env.VITE_SITE_URL;

    return {
      meta: generateMeta({
        title: article?.title ?? "Article",
        description: article?.description ?? "Keyset on Azertykeycaps",
        path: `/articles/${params.slug}`,
        image: article?.img.url,
        type: "article",
      }),
      links: [generateCanonical(`/articles/${params.slug}`)],
      scripts: article
        ? [
            generateJsonLd({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.description,
              image: article.img.url,
              url: `${siteUrl}/articles/${article.slug}`,
              datePublished: article.createdAt,
              dateModified: article.updatedAt,
              author: {
                "@type": "Organization",
                name: "Azertykeycaps",
              },
              publisher: {
                "@type": "Organization",
                name: "Azertykeycaps",
                logo: {
                  "@type": "ImageObject",
                  url: `${siteUrl}/logo.png`,
                },
              },
            }),
          ]
        : [],
    };
  },
});
```

---

## Checklist for New Routes

- [ ] Title meta tag (unique, max 60 chars)
- [ ] Description meta tag (unique, 150-160 chars)
- [ ] Open Graph tags (og:title, og:description, og:image, og:url, og:type)
- [ ] Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
- [ ] Canonical URL link
- [ ] JSON-LD structured data (appropriate type for page)
- [ ] Preload critical images (if above fold)
- [ ] Add to sitemap (if public)
- [ ] Test with Google Rich Results Test
- [ ] Test social sharing previews

---

## Testing Tools

| Tool                      | Purpose               | URL                                          |
| ------------------------- | --------------------- | -------------------------------------------- |
| Google Search Console     | Monitor indexing      | https://search.google.com/search-console     |
| Google Rich Results Test  | Validate JSON-LD      | https://search.google.com/test/rich-results  |
| Schema.org Validator      | Debug structured data | https://validator.schema.org/                |
| Facebook Sharing Debugger | Test OG tags          | https://developers.facebook.com/tools/debug/ |
| Twitter Card Validator    | Test Twitter cards    | https://cards-dev.twitter.com/validator      |
| PageSpeed Insights        | Core Web Vitals       | https://pagespeed.web.dev/                   |

---

## Common Mistakes to Avoid

### 1. Missing Canonical URLs

```tsx
// Bad: No canonical
head: () => ({
  meta: [{ title: "Page" }],
});

// Good: Always include canonical
head: () => ({
  meta: [{ title: "Page" }],
  links: [{ rel: "canonical", href: `${siteUrl}/page` }],
});
```

### 2. Relative URLs in OG Tags

```tsx
// Bad: Relative URL
{ property: "og:image", content: "/images/og.png" }

// Good: Absolute URL
{ property: "og:image", content: `${siteUrl}/images/og.png` }
```

### 3. Duplicate Titles

```tsx
// Bad: Same title everywhere
{
  title: "Azertykeycaps";
}

// Good: Unique, descriptive titles
{
  title: "Cherry Profile Keysets - Azertykeycaps";
}
```

### 4. Missing Alt Text

```tsx
// Bad: No alt text
<img src={image.url} />

// Good: Descriptive alt text
<img src={image.url} alt={`${article.title} keyset preview`} />
```

### 5. Not Using Semantic HTML

```tsx
// Bad: Generic divs
<div className="article">
  <div className="title">{title}</div>
</div>

// Good: Semantic elements
<article>
  <h1>{title}</h1>
</article>
```

---

## Version History

| Version | Date       | Changes                        |
| ------- | ---------- | ------------------------------ |
| 1.0     | 2026-01-19 | Initial SEO/LLMO documentation |
