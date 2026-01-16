# Performance Optimization Guide

This document outlines performance best practices for the Azertykeycaps TanStack Start application, optimized for Lighthouse scores.

## Core Web Vitals Targets

| Metric      | Target  | Description                                   |
| ----------- | ------- | --------------------------------------------- |
| **LCP**     | < 2.5s  | Largest Contentful Paint                      |
| **FID/INP** | < 100ms | First Input Delay / Interaction to Next Paint |
| **CLS**     | < 0.1   | Cumulative Layout Shift                       |
| **FCP**     | < 1.8s  | First Contentful Paint                        |
| **TTFB**    | < 800ms | Time to First Byte                            |

---

## 1. Font Loading (CRITICAL)

### Self-Host Fonts with Fontsource

**Why:** Google Fonts adds render-blocking requests. Self-hosting eliminates external dependencies and reduces TTFB.

**Implementation:**

```bash
# Install font package
bun add @fontsource/space-mono
```

```css
/* apps/web/src/index.css */
@import "@fontsource/space-mono/400.css";
@import "@fontsource/space-mono/700.css";
```

**DO NOT:**

```tsx
// Bad - render-blocking external requests
links: [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=..." },
];
```

**Impact:** -100-300ms on FCP/LCP

---

## 2. Image Optimization (CRITICAL)

### 2.1 Hero Images (LCP Elements)

For above-the-fold hero images, always include:

```tsx
<img
  src={imageUrl}
  alt="Description"
  loading="eager" // Don't lazy load LCP images
  fetchPriority="high" // Tell browser this is important
  decoding="async" // Don't block main thread
  width={1200} // Explicit dimensions prevent CLS
  height={675}
/>
```

### 2.2 Preload LCP Images

Add preload links in the route's `head()` function:

```tsx
// TanStack Start route
export const Route = createFileRoute("/articles/$slug")({
  head: ({ loaderData }) => ({
    links: loaderData?.article?.img.url
      ? [
          {
            rel: "preload",
            as: "image",
            href: loaderData.article.img.url,
          },
        ]
      : [],
  }),
});
```

### 2.3 Lazy-Loaded Images (Below Fold)

For images below the fold, use responsive images with lazy loading:

```tsx
<img
  src={image.sizes?.card?.url ?? image.url}
  srcSet={`${image.sizes?.thumbnail?.url} 400w, ${image.sizes?.card?.url} 768w`}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt={image.alt}
  loading="lazy"
  decoding="async"
  width={768} // Always include dimensions!
  height={432}
/>
```

### 2.4 CMS Image Sizes

Configure appropriate image sizes in Payload CMS:

```typescript
// apps/cms/src/collections/Media.ts
imageSizes: [
  { name: "thumbnail", width: 400, height: 225 },   // Card previews
  { name: "card", width: 768, height: 432 },        // Grid cards
  { name: "hero", width: 1200, height: 675 },       // Detail pages
],
formatOptions: {
  format: "webp",
  options: { quality: 80 }
}
```

**Impact:** -200-500ms LCP, CLS < 0.1

---

## 3. Bundle Size Optimization (HIGH)

### 3.1 Lazy Load Devtools (Development Only)

Devtools add ~100KB to the bundle. Conditionally load them:

```tsx
// apps/web/src/routes/__root.tsx
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : () => null;

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  : () => null;
```

### 3.2 Lazy Load Rare Components

Components that aren't always needed (toasts, modals, sheets) should be lazy loaded:

```tsx
const Toaster = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));

// Wrap in Suspense
<Suspense fallback={null}>
  <Toaster richColors />
</Suspense>;
```

### 3.3 Lucide-React Optimization

Lucide icons can add significant bundle size. Configure Vite to optimize:

```typescript
// apps/web/vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          lucide: ["lucide-react"],
        },
      },
    },
  },
});
```

**Impact:** -50-150KB bundle size, faster TTI

---

## 4. CSS Performance (MEDIUM)

### 4.1 Content Visibility for Lists

Use `content-visibility: auto` to skip rendering off-screen items:

```css
/* apps/web/src/index.css */
@layer utilities {
  .article-grid > li {
    content-visibility: auto;
    contain-intrinsic-size: auto 320px; /* Estimated item height */
  }
}
```

```tsx
<ul className="article-grid grid gap-6 @sm:grid-cols-2 @lg:grid-cols-3">
  {articles.map((article) => (
    <li key={article.id}>
      <ArticleCard article={article} />
    </li>
  ))}
</ul>
```

**Impact:** Faster initial render for long lists

---

## 5. Data Loading Patterns (HIGH)

### 5.1 Parallel Data Fetching

Always fetch independent data in parallel:

```typescript
// Good - parallel fetching
const [socialNetworks, profiles] = await Promise.all([
  client.globals.socialNetworks.query(),
  client.articles.profiles.query({ limit: 100 }),
]);

// Bad - sequential fetching (waterfall)
const socialNetworks = await client.globals.socialNetworks.query();
const profiles = await client.articles.profiles.query({ limit: 100 });
```

### 5.2 Cache Headers

Set appropriate cache headers for SSR pages:

```typescript
export const Route = createFileRoute("/_app/")({
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 60_000, // Client considers data fresh for 1 minute
  gcTime: 5 * 60_000, // Keep in memory for 5 minutes
});
```

---

## 6. Preloading Strategies (MEDIUM)

### 6.1 Link Preloading

TanStack Router supports intelligent preloading:

```tsx
// Preload on hover/focus intent (default)
<Link to="/articles/$slug" preload="intent" />

// Preload when link enters viewport
<Link to="/profile/$slug" preload="viewport" />

// Preload immediately on render
<Link to="/dashboard" preload="render" />
```

### 6.2 Router Configuration

Configure default preloading behavior:

```typescript
// apps/web/src/router.tsx
const router = createTanStackRouter({
  defaultPreload: "intent", // Preload on hover/focus
  defaultPreloadDelay: 50, // 50ms delay before preload
  defaultPreloadStaleTime: 0, // Always revalidate
});
```

---

## 7. Quick Reference Checklist

### Before Deploying New Pages

- [ ] Hero image has `fetchPriority="high"` and `loading="eager"`
- [ ] All images have explicit `width` and `height` attributes
- [ ] LCP image is preloaded in `head()` function
- [ ] No Google Fonts or external font requests
- [ ] Devtools are lazy-loaded (dev only)
- [ ] Data fetching is parallelized with `Promise.all()`
- [ ] Cache headers are set appropriately

### Image Checklist

| Location          | loading | fetchPriority | width/height |
| ----------------- | ------- | ------------- | ------------ |
| Hero (above fold) | `eager` | `high`        | Required     |
| Cards (grid)      | `lazy`  | -             | Required     |
| Thumbnails        | `lazy`  | -             | Required     |

---

## 8. Monitoring Performance

### Run Lighthouse Locally

```bash
# Build production version
bun run build

# Serve and test
bunx lighthouse http://localhost:3001 --view
```

### PageSpeed Insights

Test production site: https://pagespeed.web.dev/

### Key Metrics to Watch

1. **LCP** - Usually the hero image or main heading
2. **CLS** - Check for images without dimensions, font swaps
3. **TBT** - Check for heavy JavaScript execution
4. **FCP** - Check for render-blocking resources

---

## 9. Common Performance Issues

### Issue: High LCP

**Causes:**

- Hero image not preloaded
- Missing `fetchPriority="high"`
- Large unoptimized images
- Render-blocking fonts

**Solutions:**

- Add preload link in route `head()`
- Use optimized image sizes from CMS
- Self-host fonts with Fontsource

### Issue: High CLS

**Causes:**

- Images without dimensions
- Font swap (FOUT)
- Dynamic content insertion

**Solutions:**

- Always add `width` and `height` to images
- Use `font-display: optional` or self-host fonts
- Reserve space for dynamic content with CSS

### Issue: High TBT/TTI

**Causes:**

- Large JavaScript bundles
- Devtools in production
- Synchronous heavy operations

**Solutions:**

- Lazy load non-critical components
- Use `import.meta.env.DEV` for devtools
- Use code splitting with dynamic imports

---

## 10. Future Optimizations

Consider implementing these additional optimizations:

1. **AVIF Images** - Add AVIF format to CMS for smaller files
2. **Service Worker** - Cache static assets for repeat visits
3. **Prefetch DNS** - Add `dns-prefetch` for external domains
4. **HTTP/2 Push** - Server push critical resources
5. **Edge Caching** - Cloudflare cache optimization
