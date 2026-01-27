# Image Optimization with Cloudflare Images

This document covers image optimization strategies using Cloudflare Images transformations, including current implementation, improvements, and advanced features.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Current Implementation](#current-implementation)
- [Performance Improvements](#performance-improvements)
- [New Cloudflare Images Features](#new-cloudflare-images-features)
- [Images Binding (Worker API)](#images-binding-worker-api)
- [Cost Optimization](#cost-optimization)
- [Implementation Guide](#implementation-guide)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Image Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           IMAGE DELIVERY FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

1. UPLOAD FLOW:
   User → CMS Admin → Payload CMS Worker → R2 Bucket (original stored)

2. REQUEST FLOW (Production):
   Browser Request:
   https://api.example.com/cdn-cgi/image/width=800,format=auto/api/media/photo.jpg
                              │
                              ▼
   ┌──────────────────────────────────────────┐
   │  Cloudflare Edge (cdn-cgi/image)         │
   │  - Checks edge cache                     │
   │  - If miss: fetches origin & transforms  │
   │  - Returns WebP/AVIF based on Accept     │
   │  - Caches transformed variants           │
   └──────────────────────────────────────────┘
                              │
                              ▼
   ┌──────────────────────────────────────────┐
   │  Server Worker (/api/media/*)            │
   │  - Media cache middleware (7 days)       │
   │  - Proxies to CMS                        │
   └──────────────────────────────────────────┘
                              │
                              ▼
   ┌──────────────────────────────────────────┐
   │  CMS Worker (Payload)                    │
   │  - Serves original from R2               │
   └──────────────────────────────────────────┘
```

### Key Components

| Component        | Location                      | Purpose                                        |
| ---------------- | ----------------------------- | ---------------------------------------------- |
| `image-utils.ts` | `apps/web/src/lib/`           | Cloudflare Images URL transformation utilities |
| `OptimizedImage` | `apps/web/src/components/ui/` | Responsive image component                     |
| `Media.ts`       | `apps/cms/src/collections/`   | Payload CMS media collection                   |
| `media.ts`       | `apps/server/src/routes/`     | Media proxy with caching                       |

---

## Current Implementation

### What's Already Implemented

| Feature                                       | Status | Notes                                     |
| --------------------------------------------- | ------ | ----------------------------------------- |
| URL-based transformations (`/cdn-cgi/image/`) | ✅     | Using `getOptimizedImageUrl()`            |
| Responsive srcset generation                  | ✅     | `generateSrcSet()` with width presets     |
| Automatic format selection (`format=auto`)    | ✅     | WebP/AVIF based on browser                |
| LCP image preloading                          | ✅     | `getPreloadImageUrl()` in route heads     |
| Priority loading attributes                   | ✅     | `loading="eager"`, `fetchPriority="high"` |
| Media caching                                 | ✅     | 7-day cache with SWR                      |
| R2 storage for originals                      | ✅     | Via Payload CMS                           |

### Current Transformation Options

```typescript
// apps/web/src/lib/image-utils.ts
interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number; // Default: 85
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  gravity?: "auto" | "center" | "left" | "right" | "top" | "bottom";
  sharpen?: number; // 0-10
}
```

---

## Performance Improvements

### 1. Sharpen Downscaled Images

When images are downscaled, they can appear soft. Adding `sharpen=1` restores crispness.

**Impact:** Better visual quality with minimal file size increase

```typescript
// Recommended: Always add sharpen=1 for downscaled images
getOptimizedImageUrl(src, {
  width: 800,
  sharpen: 1, // Add this for downscaled images
});
```

### 2. Slow Connection Quality Adaptation

Serve lower quality images to users on slow connections (2G/3G networks).

**Impact:** Faster loading on slow networks, better UX

**Requirements:** Enable client hints via HTTP header:

```
Accept-CH: RTT, Save-Data, ECT, Downlink
```

```typescript
// URL parameter
slow-connection-quality=50

// When client hints indicate slow connection:
// - RTT > 150ms
// - Save-Data: on
// - ECT: slow-2g, 2g, or 3g
// - Downlink < 5Mbps
```

### 3. Enhanced Preloading with imagesrcset

Current preloading only hints at a single image. Enhanced preloading tells the browser about all responsive variants.

**Impact:** Browser can choose optimal size during preload phase

```typescript
// Current (basic)
{
  rel: "preload",
  as: "image",
  href: heroImageUrl,
}

// Enhanced (with responsive hints)
{
  rel: "preload",
  as: "image",
  href: heroImageUrl,
  imagesrcset: generateSrcSet(src, RESPONSIVE_WIDTHS.hero),
  imagesizes: "(max-width: 640px) 100vw, 1200px",
}
```

### 4. Error Fallback with onerror

When transformations fail, redirect to the original image instead of showing broken image.

**Impact:** Graceful degradation, better user experience

```typescript
// URL parameter (only works with URL transformations, not Workers)
onerror=redirect

// Example URL
/cdn-cgi/image/width=800,format=auto,onerror=redirect/api/media/photo.jpg
```

**Note:** This is ignored for cross-domain images but works for same-domain and subdomains.

### 5. DPR (Device Pixel Ratio) Support

Serve higher resolution images to high-DPI displays without changing srcset.

```typescript
// Instead of doubling width manually
((width = 400), (dpr = 2)); // Serves 800px image, displayed at 400px CSS
```

---

## New Cloudflare Images Features

### 1. Face-Aware Cropping

Automatically crop images to keep faces in frame. Perfect for profile pictures and user-generated content.

```typescript
// Crop to face with some background
((gravity = face), (fit = cover), (width = 400), (height = 400));

// Zoom closer to face (0-1 scale)
((gravity = face), (zoom = 0.5), (fit = cover), (width = 400), (height = 400));
```

**Use Cases:**

- Profile/avatar images
- User-uploaded photos
- Team member photos

### 2. Background Removal (Segment)

Automatically remove backgrounds from images, outputting transparent PNG.

```typescript
// Remove background, keep foreground subject
segment = foreground;

// Combine with format for transparency
((segment = foreground), (format = png));
// or
((segment = foreground), (format = webp)); // WebP supports transparency
```

**Use Cases:**

- Product images
- Logos with complex backgrounds
- Creating image overlays

### 3. Auto Border Trimming

Automatically remove solid color borders from images.

```typescript
// Auto-detect and trim borders
trim=border

// Custom border trimming
trim.border.color=%23FFFFFF  // Trim white borders
trim.border.tolerance=5       // Color matching tolerance (0-255)
trim.border.keep=10          // Keep 10px of border
```

**Use Cases:**

- Scanned documents
- Screenshots with borders
- Images with letterboxing

### 4. Manual Trimming

Cut specific pixels from each side.

```typescript
// Trim 20px from top, 30px right, 20px bottom, 0px left
trim = 20;
30;
20;
0;

// Or with named parameters
trim.top = 20;
trim.right = 30;
trim.bottom = 20;
trim.left = 0;
```

### 5. Flip and Rotate

```typescript
// Flip horizontally
flip = h;

// Flip vertically
flip = v;

// Flip both
flip = hv;

// Rotate (90, 180, or 270 degrees)
rotate = 90;

// Combine: flip then rotate
((flip = h), (rotate = 90));
```

### 6. Color Adjustments

```typescript
// Brightness (1.0 = no change, 0.5 = darker, 2.0 = brighter)
brightness = 1.2;

// Contrast (1.0 = no change)
contrast = 1.1;

// Saturation (0 = grayscale, 1.0 = no change, 2.0 = vibrant)
saturation = 1.3;

// Gamma/exposure (1.0 = no change)
gamma = 1.1;
```

### 7. Border Addition

Add borders around images (useful for framing).

```typescript
// Workers only - add 10px white border
cf: {
  image: {
    border: {
      color: "#FFFFFF",
      width: 10
    }
  }
}

// Or different widths per side
cf: {
  image: {
    border: {
      color: "rgb(0,0,0)",
      top: 5,
      right: 10,
      bottom: 5,
      left: 10
    }
  }
}
```

---

## Images Binding (Worker API)

For advanced use cases, you can use the Images binding to transform images directly in Workers without URL-based transformations.

### When to Use Binding vs URL

| Use Case                | Approach                       |
| ----------------------- | ------------------------------ |
| Simple resize/format    | URL transformation             |
| Responsive images       | URL transformation with srcset |
| Watermarking            | Images Binding                 |
| Chained transformations | Images Binding                 |
| Pre-upload processing   | Images Binding                 |
| Non-public images       | Images Binding                 |

### Setup

```jsonc
// wrangler.jsonc
{
  "images": {
    "binding": "IMAGES",
  },
}
```

### Basic Usage

```typescript
// Transform and return
const result = await env.IMAGES.input(imageStream)
  .transform({ width: 800, sharpen: 1 })
  .output({ format: "image/avif" });

return result.response();
```

### Watermarking Example

```typescript
// Fetch original image and watermark
const image = await fetch(imageUrl);
const watermark = await fetch(watermarkUrl);

// Apply watermark
const result = await env.IMAGES.input(image.body)
  .draw(
    env.IMAGES.input(watermark.body).transform({ width: 100, height: 100 }),
    { bottom: 10, right: 10, opacity: 0.75 },
  )
  .output({ format: "image/avif" });

return result.response();
```

### Get Image Info

```typescript
const info = await env.IMAGES.info(imageStream);
// Returns: { format, fileSize, width, height }
```

### Upload to R2 After Transform

```typescript
// Transform then upload
const result = await env.IMAGES.input(uploadedImage)
  .transform({ width: 1920, quality: 85 })
  .output({ format: "image/avif" });

// Upload to R2
const fileName = `processed-${Date.now()}.avif`;
await env.R2.put(fileName, result.response().body);
```

---

## Cost Optimization

### Understanding Billing

Cloudflare Images bills based on **unique transformations**:

| Metric                 | Free Tier      | Paid Tier               |
| ---------------------- | -------------- | ----------------------- |
| Unique transformations | 5,000/month    | $0.50/1,000 after 5,000 |
| Billing window         | 30-day sliding | 30-day sliding          |

**Key Points:**

- A unique transformation = unique combination of source image + parameters
- Same transformation requested twice in 30 days = 1 billable request
- `format=auto` counts as 1 transformation even if AVIF/WebP are served
- Transformations are cached at the edge

### Optimization Strategies

#### 1. Use Predefined Width Presets

```typescript
// Good: Limited set of widths
const RESPONSIVE_WIDTHS = {
  thumbnail: [320, 480, 640],
  card: [400, 768, 1024],
  hero: [640, 960, 1200, 1920],
};

// Bad: Arbitrary widths per request
getOptimizedImageUrl(src, { width: 847 }); // Creates unique transformation
```

#### 2. Consistent Parameter Ordering

Cloudflare normalizes parameters, but being consistent helps debugging:

```typescript
// Consistent order: width, height, fit, format, quality
`width=800,format=auto,quality=85`;
```

#### 3. Leverage Edge Caching

Transformed images are cached for 1 hour minimum (longer with origin Cache-Control).

```typescript
// Origin should return appropriate Cache-Control
"Cache-Control": "public, max-age=31536000"  // 1 year for images
```

#### 4. Monitor Usage

Track unique transformations in Cloudflare dashboard:
**Images > Transformations > Usage**

---

## Implementation Guide

### Updated image-utils.ts

The following additions are recommended for `apps/web/src/lib/image-utils.ts`:

```typescript
/**
 * Extended transformation options with new Cloudflare Images features
 */
export interface ImageTransformOptions {
  // Sizing
  width?: number;
  height?: number;
  dpr?: number; // Device pixel ratio multiplier

  // Fitting
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  gravity?: "auto" | "face" | "center" | "left" | "right" | "top" | "bottom";
  zoom?: number; // 0-1, for gravity=face

  // Format & Quality
  format?: "auto" | "webp" | "avif" | "jpeg" | "png" | "json";
  quality?: number;
  slowConnectionQuality?: number; // Quality for slow connections

  // Enhancements
  sharpen?: number; // 0-10, recommended: 1 for downscaled
  blur?: number; // 1-250

  // Color adjustments
  brightness?: number; // 0.5-2.0, 1.0 = no change
  contrast?: number;
  saturation?: number;
  gamma?: number;

  // Cropping & Trimming
  trim?:
    | "border"
    | { top?: number; right?: number; bottom?: number; left?: number };
  trimBorderColor?: string;
  trimBorderTolerance?: number;

  // Transformations
  rotate?: 90 | 180 | 270;
  flip?: "h" | "v" | "hv";

  // AI Features
  segment?: "foreground"; // Background removal

  // Error handling
  onerror?: "redirect"; // Fallback to original on error

  // Metadata
  metadata?: "none" | "copyright" | "keep";
  anim?: boolean; // Preserve animation frames
}

/**
 * Build Cloudflare Images transformation URL parameters
 */
function buildTransformParams(options: ImageTransformOptions): string {
  const params: string[] = [];

  // Sizing
  if (options.width) params.push(`width=${options.width}`);
  if (options.height) params.push(`height=${options.height}`);
  if (options.dpr && options.dpr !== 1) params.push(`dpr=${options.dpr}`);

  // Fitting
  if (options.fit) params.push(`fit=${options.fit}`);
  if (options.gravity) params.push(`gravity=${options.gravity}`);
  if (options.zoom !== undefined) params.push(`zoom=${options.zoom}`);

  // Format & Quality
  params.push(`format=${options.format ?? "auto"}`);
  params.push(`quality=${options.quality ?? DEFAULT_IMAGE_QUALITY}`);
  if (options.slowConnectionQuality) {
    params.push(`slow-connection-quality=${options.slowConnectionQuality}`);
  }

  // Enhancements
  if (options.sharpen) params.push(`sharpen=${options.sharpen}`);
  if (options.blur) params.push(`blur=${options.blur}`);

  // Color adjustments
  if (options.brightness) params.push(`brightness=${options.brightness}`);
  if (options.contrast) params.push(`contrast=${options.contrast}`);
  if (options.saturation) params.push(`saturation=${options.saturation}`);
  if (options.gamma) params.push(`gamma=${options.gamma}`);

  // Trimming
  if (options.trim === "border") {
    params.push("trim=border");
    if (options.trimBorderColor) {
      params.push(
        `trim.border.color=${encodeURIComponent(options.trimBorderColor)}`,
      );
    }
    if (options.trimBorderTolerance !== undefined) {
      params.push(`trim.border.tolerance=${options.trimBorderTolerance}`);
    }
  } else if (typeof options.trim === "object") {
    const { top = 0, right = 0, bottom = 0, left = 0 } = options.trim;
    params.push(`trim=${top};${right};${bottom};${left}`);
  }

  // Transformations
  if (options.rotate) params.push(`rotate=${options.rotate}`);
  if (options.flip) params.push(`flip=${options.flip}`);

  // AI Features
  if (options.segment) params.push(`segment=${options.segment}`);

  // Error handling
  if (options.onerror) params.push(`onerror=${options.onerror}`);

  // Metadata
  if (options.metadata) params.push(`metadata=${options.metadata}`);
  if (options.anim === false) params.push("anim=false");

  return params.join(",");
}
```

### Enhanced Preload Function

```typescript
/**
 * Generate preload link attributes for LCP images
 *
 * Returns object suitable for TanStack Start's head() function
 */
export function getPreloadLinkAttributes(
  src: string | null | undefined,
  type: "hero" | "card" | "thumbnail" = "card",
  sizes?: string,
): {
  rel: "preload";
  as: "image";
  href: string;
  imagesrcset?: string;
  imagesizes?: string;
} | null {
  if (!src) return null;

  const widthMap = {
    hero: {
      widths: RESPONSIVE_WIDTHS.hero,
      defaultSizes: "(max-width: 640px) 100vw, 1200px",
    },
    card: {
      widths: RESPONSIVE_WIDTHS.card,
      defaultSizes: "(max-width: 640px) 100vw, 768px",
    },
    thumbnail: { widths: RESPONSIVE_WIDTHS.thumbnail, defaultSizes: "320px" },
  };

  const { widths, defaultSizes } = widthMap[type];
  const srcSet = generateSrcSet(src, widths, { sharpen: 1 });
  const fallbackUrl = getOptimizedImageUrl(src, {
    width: Math.max(...widths),
    sharpen: 1,
  });

  return {
    rel: "preload",
    as: "image",
    href: fallbackUrl,
    ...(srcSet && {
      imagesrcset: srcSet,
      imagesizes: sizes ?? defaultSizes,
    }),
  };
}
```

### Avatar/Profile Image Helper

```typescript
/**
 * Get optimized URL for avatar/profile images with face detection
 */
export function getAvatarUrl(
  src: string | null | undefined,
  size: number = 200,
): string {
  return getOptimizedImageUrl(src, {
    width: size,
    height: size,
    fit: "cover",
    gravity: "face",
    zoom: 0.3, // Include some background around face
    sharpen: 1,
  });
}
```

### Product Image Helper (with background removal)

```typescript
/**
 * Get optimized URL for product images with optional background removal
 */
export function getProductImageUrl(
  src: string | null | undefined,
  options: {
    width?: number;
    removeBackground?: boolean;
  } = {},
): string {
  const { width = 800, removeBackground = false } = options;

  return getOptimizedImageUrl(src, {
    width,
    fit: "contain",
    sharpen: 1,
    ...(removeBackground && {
      segment: "foreground",
      format: "webp", // Need format with transparency support
    }),
  });
}
```

---

## Troubleshooting

### Common Error Codes

| Code | Meaning             | Solution                                         |
| ---- | ------------------- | ------------------------------------------------ |
| 9401 | Invalid arguments   | Check transformation parameters                  |
| 9402 | Image too large     | Reduce source image size (max 100MP)             |
| 9403 | Request loop        | Check Worker isn't fetching its own URL          |
| 9404 | Image not found     | Verify source URL is accessible                  |
| 9413 | Exceeds 100MP limit | Use smaller source image                         |
| 9422 | Rate limit exceeded | Upgrade to paid plan or reduce unique transforms |
| 9520 | Unsupported format  | Use supported input format                       |

### Debug Tips

1. **Check Cf-Resized header** - If missing, transformation wasn't attempted
2. **Use format=json** - Returns image info instead of image
3. **Test with single transformation** - Isolate which parameter fails
4. **Check Via header** - Contains "image-resizing" when processed

### Local Development

Cloudflare Images transformations only work on deployed Cloudflare domains. In development:

```typescript
// image-utils.ts already handles this
const IS_DEV = process.env.NODE_ENV !== "production";

if (IS_DEV) {
  return src; // Return original URL in dev
}
```

For local testing of transformations, you can:

1. Deploy to a preview environment
2. Use Wrangler's `--remote` flag for high-fidelity testing

---

## Quick Reference

### URL Format

```
https://{zone}/cdn-cgi/image/{options}/{source-image-path}
```

### Most Common Options

```
width=800           # Max width
format=auto         # WebP/AVIF auto-selection
quality=85          # Quality 1-100
fit=cover           # Fill area, crop if needed
sharpen=1           # Recommended for downscaled
```

### Responsive Image Pattern

```html
<img
  src="/cdn-cgi/image/width=1024,format=auto,quality=85/image.jpg"
  srcset="
    /cdn-cgi/image/width=400,format=auto/image.jpg   400w,
    /cdn-cgi/image/width=768,format=auto/image.jpg   768w,
    /cdn-cgi/image/width=1024,format=auto/image.jpg 1024w
  "
  sizes="(max-width: 640px) 100vw, 50vw"
  loading="lazy"
  decoding="async"
  width="1024"
  height="576"
  alt="Description"
/>
```

### LCP Image Pattern

```html
<img
  src="/cdn-cgi/image/width=1200,format=auto,quality=85/hero.jpg"
  loading="eager"
  fetchpriority="high"
  decoding="sync"
  width="1200"
  height="675"
  alt="Hero image"
/>
```

---

## Related Documentation

- [PERFORMANCE.md](./PERFORMANCE.md) - General performance optimization
- [CACHING.md](./CACHING.md) - Caching strategies
- [Cloudflare Images Docs](https://developers.cloudflare.com/images/)
