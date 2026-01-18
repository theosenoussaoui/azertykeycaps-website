/**
 * Cloudflare Images transformation utilities
 *
 * Uses Cloudflare's /cdn-cgi/image/ endpoint to transform images on-the-fly.
 * Images are automatically converted to WebP/AVIF and resized at the edge.
 *
 * In local development, transformations are skipped since Cloudflare's
 * /cdn-cgi/image/ endpoint is only available on deployed Cloudflare domains.
 *
 * @see https://developers.cloudflare.com/images/transform-images/transform-via-url/
 */

/**
 * Whether we're in development mode.
 * Uses process.env.NODE_ENV which works on the server side.
 */
const IS_DEV = process.env.NODE_ENV !== "production";

/** Default image quality (1-100). 85 is a good balance of quality and file size. */
export const DEFAULT_IMAGE_QUALITY = 85;

/** Common responsive image widths for srcset generation */
export const RESPONSIVE_WIDTHS = {
  /** For thumbnails and small cards */
  thumbnail: [320, 480, 640],
  /** For medium cards and content images */
  card: [400, 768, 1024],
  /** For hero images and full-width content */
  hero: [640, 960, 1200, 1920],
} as const;

export interface ImageTransformOptions {
  /** Maximum width in pixels */
  width?: number;
  /** Maximum height in pixels */
  height?: number;
  /** Image quality (1-100). Default: 85 */
  quality?: number;
  /**
   * How to fit the image within width/height bounds.
   * - scale-down: Shrink to fit, never enlarge
   * - contain: Fit within bounds, preserve aspect ratio
   * - cover: Fill bounds, crop if needed
   * - crop: Shrink and crop to fit
   * - pad: Fit within bounds, add background padding
   */
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  /**
   * Output format.
   * - auto: Serve WebP/AVIF based on browser support (recommended)
   * - webp, avif, jpeg, png: Force specific format
   */
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  /**
   * Gravity for cropping (when fit=cover or fit=crop).
   * - auto: Smart cropping based on image content
   * - center, left, right, top, bottom: Crop from specific side
   */
  gravity?: "auto" | "center" | "left" | "right" | "top" | "bottom";
  /** Sharpen filter strength (0-10). Recommended: 1 for downscaled images */
  sharpen?: number;
}

/**
 * Build Cloudflare Images transformation URL parameters string.
 *
 * @example
 * buildTransformParams({ width: 800, format: 'auto' })
 * // Returns: "width=800,format=auto,quality=85"
 */
function buildTransformParams(options: ImageTransformOptions): string {
  const params: string[] = [];

  if (options.width) params.push(`width=${options.width}`);
  if (options.height) params.push(`height=${options.height}`);
  if (options.fit) params.push(`fit=${options.fit}`);
  if (options.gravity) params.push(`gravity=${options.gravity}`);
  if (options.sharpen) params.push(`sharpen=${options.sharpen}`);

  // Always include format (default to auto for best compression)
  params.push(`format=${options.format ?? "auto"}`);

  // Always include quality
  params.push(`quality=${options.quality ?? DEFAULT_IMAGE_QUALITY}`);

  return params.join(",");
}

/**
 * Transform an image URL to use Cloudflare Images optimization.
 *
 * Takes an absolute image URL (e.g., from Payload CMS) and wraps it with
 * Cloudflare's /cdn-cgi/image/ transformation endpoint.
 *
 * In local development, returns the original URL since Cloudflare Images
 * transformations are only available on deployed Cloudflare domains.
 *
 * @param src - Absolute image URL (must start with http:// or https://)
 * @param options - Transformation options
 * @returns Optimized image URL (or original in dev mode)
 *
 * @example
 * getOptimizedImageUrl('https://api.example.com/api/media/photo.jpg', { width: 800 })
 * // Returns: "https://api.example.com/cdn-cgi/image/width=800,format=auto,quality=85/api/media/photo.jpg"
 */
export function getOptimizedImageUrl(
  src: string | null | undefined,
  options: ImageTransformOptions = {},
): string {
  if (!src) return "";

  // In local development, skip transformations (CF Images not available)
  if (IS_DEV) {
    return src;
  }

  // Parse the URL to extract origin and path
  try {
    const url = new URL(src);
    const params = buildTransformParams(options);

    // Insert /cdn-cgi/image/{params}/ before the pathname
    return `${url.origin}/cdn-cgi/image/${params}${url.pathname}${url.search}`;
  } catch {
    // If URL parsing fails, return original (might be a relative URL or invalid)
    console.warn(`[image-utils] Failed to parse URL: ${src}`);
    return src;
  }
}

/**
 * Generate an optimized srcset string for responsive images.
 *
 * Creates multiple image variants at different widths, allowing browsers
 * to choose the most appropriate size based on viewport and device pixel ratio.
 *
 * In local development, returns an empty string since all variants would be
 * the same (no transformations available).
 *
 * @param src - Absolute image URL
 * @param widths - Array of widths to generate (in pixels)
 * @param options - Base transformation options (applied to all variants)
 * @returns srcset string for use in <img> or <source> elements (empty in dev)
 *
 * @example
 * generateSrcSet('https://api.example.com/media/photo.jpg', [400, 800, 1200])
 * // Returns: "https://.../cdn-cgi/image/width=400,.../photo.jpg 400w, https://.../cdn-cgi/image/width=800,.../photo.jpg 800w, ..."
 */
export function generateSrcSet(
  src: string | null | undefined,
  widths: readonly number[],
  options: Omit<ImageTransformOptions, "width"> = {},
): string {
  if (!src) return "";

  // In local development, don't generate srcset (all would point to same image)
  if (IS_DEV) {
    return "";
  }

  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(src, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Get the optimized URL for preloading an image.
 *
 * Uses a specific width appropriate for LCP (Largest Contentful Paint) optimization.
 * The preloaded image should match what will be displayed above the fold.
 *
 * @param src - Absolute image URL
 * @param type - Type of image being preloaded
 * @returns Optimized URL suitable for <link rel="preload">
 */
export function getPreloadImageUrl(
  src: string | null | undefined,
  type: "hero" | "card" | "thumbnail" = "card",
): string {
  const widthMap = {
    hero: 1200,
    card: 768,
    thumbnail: 480,
  };

  return getOptimizedImageUrl(src, {
    width: widthMap[type],
    format: "auto",
  });
}
