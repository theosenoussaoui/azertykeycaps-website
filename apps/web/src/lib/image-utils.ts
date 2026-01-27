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
 * @see docs/architecture/IMAGE_OPTIMIZATION.md
 */

/**
 * Whether we're in development mode.
 * Uses process.env.NODE_ENV which works on the server side.
 */
const IS_DEV = process.env.NODE_ENV !== "production";

/** Default image quality (1-100). 85 is a good balance of quality and file size. */
export const DEFAULT_IMAGE_QUALITY = 85;

/**
 * Supported INPUT formats for Cloudflare Images transformations.
 * AVIF is only supported as OUTPUT, not INPUT.
 *
 * @see https://developers.cloudflare.com/images/transform-images/#supported-input-formats
 */
const SUPPORTED_INPUT_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "heic",
  "heif",
]);

/**
 * Check if a URL points to an image format that Cloudflare Images can transform.
 * AVIF files are NOT supported as input (only as output).
 */
function isTransformableFormat(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const extension = pathname.split(".").pop();
    return extension ? SUPPORTED_INPUT_EXTENSIONS.has(extension) : true;
  } catch {
    // If URL parsing fails, assume it's transformable (will fail gracefully)
    return true;
  }
}

/** Default quality for slow connections (2G/3G networks) */
export const SLOW_CONNECTION_QUALITY = 60;

/** Common responsive image widths for srcset generation */
export const RESPONSIVE_WIDTHS = {
  /** For thumbnails and small cards */
  thumbnail: [320, 480, 640],
  /** For medium cards and content images */
  card: [400, 768, 1024],
  /** For hero images and full-width content */
  hero: [640, 960, 1200, 1920],
} as const;

/**
 * Extended transformation options for Cloudflare Images
 *
 * @see https://developers.cloudflare.com/images/transform-images/transform-via-url/#options
 */
export interface ImageTransformOptions {
  // ─────────────────────────────────────────────────────────────────────────
  // Sizing
  // ─────────────────────────────────────────────────────────────────────────

  /** Maximum width in pixels */
  width?: number;
  /** Maximum height in pixels */
  height?: number;
  /**
   * Device Pixel Ratio multiplier for width/height.
   * Makes it easier to specify higher-DPI sizes.
   * @example dpr=2 with width=400 serves 800px image displayed at 400 CSS px
   */
  dpr?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Fitting & Cropping
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * How to fit the image within width/height bounds.
   * - scale-down: Shrink to fit, never enlarge
   * - contain: Fit within bounds, preserve aspect ratio
   * - cover: Fill bounds, crop if needed
   * - crop: Shrink and crop to fit (never enlarge)
   * - pad: Fit within bounds, add background padding
   * - squeeze: Exact dimensions, may distort aspect ratio
   */
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad" | "squeeze";

  /**
   * Gravity for cropping (when fit=cover or fit=crop).
   * - auto: Smart cropping based on saliency detection
   * - face: Crop to keep detected faces in frame (uses AI)
   * - center, left, right, top, bottom: Crop from specific side
   */
  gravity?: "auto" | "face" | "center" | "left" | "right" | "top" | "bottom";

  /**
   * How closely to crop toward faces when gravity=face.
   * 0 = include more background, 1 = crop closely to face.
   * @default 0
   */
  zoom?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Format & Quality
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Output format.
   * - auto: Serve WebP/AVIF based on browser support (recommended)
   * - webp, avif, jpeg, png: Force specific format
   * - json: Return image metadata instead of image
   */
  format?: "auto" | "webp" | "avif" | "jpeg" | "png" | "json";

  /**
   * Image quality (1-100). Default: 85
   * Useful range is 50 (low quality) to 90 (high quality).
   */
  quality?: number;

  /**
   * Quality to use when slow connection is detected.
   * Activated when client hints indicate: RTT>150ms, Save-Data:on, ECT:2g/3g, Downlink<5Mbps
   * @see https://developers.cloudflare.com/images/transform-images/transform-via-url/#slow-connection-quality
   */
  slowConnectionQuality?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Enhancements
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Sharpening filter strength (0-10).
   * Recommended: 1 for downscaled images to restore crispness.
   */
  sharpen?: number;

  /**
   * Blur radius (1-250).
   * Note: Cannot reliably obscure content - users can modify URL.
   */
  blur?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Color Adjustments
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Brightness adjustment factor.
   * 1.0 = no change, 0.5 = darker, 2.0 = brighter
   */
  brightness?: number;

  /**
   * Contrast adjustment factor.
   * 1.0 = no change, 0.5 = low contrast, 2.0 = high contrast
   */
  contrast?: number;

  /**
   * Saturation adjustment factor.
   * 0 = grayscale, 1.0 = no change, 2.0 = vibrant
   */
  saturation?: number;

  /**
   * Gamma/exposure adjustment factor.
   * 1.0 = no change, 0.5 = darker, 2.0 = lighter
   */
  gamma?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Trimming
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Trim pixels from edges.
   * - "border": Auto-detect and trim solid color borders
   * - Object: Specify pixels to trim from each side
   */
  trim?:
    | "border"
    | { top?: number; right?: number; bottom?: number; left?: number };

  /** Border color to trim (for trim="border"). CSS color format. */
  trimBorderColor?: string;

  /** Color matching tolerance for border trimming (0-255). */
  trimBorderTolerance?: number;

  /** Pixels of original border to keep after trimming. */
  trimBorderKeep?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Transformations
  // ─────────────────────────────────────────────────────────────────────────

  /** Rotate image by degrees (90, 180, or 270). */
  rotate?: 90 | 180 | 270;

  /**
   * Flip image.
   * - h: Horizontal flip
   * - v: Vertical flip
   * - hv: Both horizontal and vertical
   */
  flip?: "h" | "v" | "hv";

  // ─────────────────────────────────────────────────────────────────────────
  // AI Features
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Background removal using AI.
   * "foreground" isolates the subject and makes background transparent.
   * @see https://developers.cloudflare.com/images/transform-images/transform-via-url/#segment
   */
  segment?: "foreground";

  // ─────────────────────────────────────────────────────────────────────────
  // Error Handling & Metadata
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fallback behavior on transformation error.
   * "redirect" redirects to original unresized image.
   * Only works for same-domain/subdomain images, not Workers.
   */
  onerror?: "redirect";

  /**
   * Metadata preservation.
   * - none: Strip all metadata
   * - copyright: Keep only copyright tag
   * - keep: Preserve most EXIF metadata
   */
  metadata?: "none" | "copyright" | "keep";

  /**
   * Whether to preserve animation frames (GIF/WebP).
   * Set to false to extract first frame only.
   * @default true
   */
  anim?: boolean;

  // ─────────────────────────────────────────────────────────────────────────
  // Background (for fit=pad or transparent images)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Background color for fit=pad or transparent images.
   * Accepts CSS colors: "#RRGGBB", "rgb(r,g,b)", "rgba(r,g,b,a)", color names
   */
  background?: string;
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

  // ─── Sizing ────────────────────────────────────────────────────────────────
  if (options.width) params.push(`width=${options.width}`);
  if (options.height) params.push(`height=${options.height}`);
  if (options.dpr && options.dpr !== 1) params.push(`dpr=${options.dpr}`);

  // ─── Fitting & Cropping ────────────────────────────────────────────────────
  if (options.fit) params.push(`fit=${options.fit}`);
  if (options.gravity) params.push(`gravity=${options.gravity}`);
  if (options.zoom !== undefined) params.push(`zoom=${options.zoom}`);

  // ─── Format & Quality ──────────────────────────────────────────────────────
  params.push(`format=${options.format ?? "auto"}`);
  params.push(`quality=${options.quality ?? DEFAULT_IMAGE_QUALITY}`);
  if (options.slowConnectionQuality) {
    params.push(`slow-connection-quality=${options.slowConnectionQuality}`);
  }

  // ─── Enhancements ──────────────────────────────────────────────────────────
  if (options.sharpen) params.push(`sharpen=${options.sharpen}`);
  if (options.blur) params.push(`blur=${options.blur}`);

  // ─── Color Adjustments ─────────────────────────────────────────────────────
  if (options.brightness) params.push(`brightness=${options.brightness}`);
  if (options.contrast) params.push(`contrast=${options.contrast}`);
  if (options.saturation) params.push(`saturation=${options.saturation}`);
  if (options.gamma) params.push(`gamma=${options.gamma}`);

  // ─── Trimming ──────────────────────────────────────────────────────────────
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
    if (options.trimBorderKeep !== undefined) {
      params.push(`trim.border.keep=${options.trimBorderKeep}`);
    }
  } else if (typeof options.trim === "object") {
    const { top = 0, right = 0, bottom = 0, left = 0 } = options.trim;
    params.push(`trim=${top};${right};${bottom};${left}`);
  }

  // ─── Transformations ───────────────────────────────────────────────────────
  if (options.rotate) params.push(`rotate=${options.rotate}`);
  if (options.flip) params.push(`flip=${options.flip}`);

  // ─── AI Features ───────────────────────────────────────────────────────────
  if (options.segment) params.push(`segment=${options.segment}`);

  // ─── Error Handling & Metadata ─────────────────────────────────────────────
  if (options.onerror) params.push(`onerror=${options.onerror}`);
  if (options.metadata) params.push(`metadata=${options.metadata}`);
  if (options.anim === false) params.push("anim=false");
  if (options.background) {
    params.push(`background=${encodeURIComponent(options.background)}`);
  }

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

  // Skip transformations for unsupported input formats (e.g., AVIF)
  // AVIF is only supported as OUTPUT format, not INPUT
  // These files are already highly optimized, so serve them directly
  if (!isTransformableFormat(src)) {
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
 * // Returns: "https://.../cdn-cgi/image/width=400,.../photo.jpg 400w, ..."
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
    sharpen: 1, // Add sharpening for better quality
  });
}

/**
 * Generate preload link attributes for LCP images with responsive hints.
 *
 * Returns an object suitable for TanStack Start's head() function with
 * imagesrcset and imagesizes for optimal browser preloading.
 *
 * @param src - Absolute image URL
 * @param type - Type of image being preloaded
 * @param sizes - Custom sizes attribute (optional)
 * @returns Preload link attributes object or null if no src
 *
 * @example
 * // In route head() function:
 * head: ({ loaderData }) => ({
 *   links: [
 *     getPreloadLinkAttributes(loaderData?.article?.img.url, "hero"),
 *   ].filter(Boolean),
 * })
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

  const config = {
    hero: {
      widths: RESPONSIVE_WIDTHS.hero,
      defaultSizes: "(max-width: 640px) 100vw, 1200px",
    },
    card: {
      widths: RESPONSIVE_WIDTHS.card,
      defaultSizes: "(max-width: 640px) 100vw, 768px",
    },
    thumbnail: {
      widths: RESPONSIVE_WIDTHS.thumbnail,
      defaultSizes: "320px",
    },
  };

  const { widths, defaultSizes } = config[type];
  const baseOptions = { sharpen: 1 };

  // In dev mode, srcSet will be empty
  const srcSet = generateSrcSet(src, widths, baseOptions);
  const fallbackUrl = getOptimizedImageUrl(src, {
    ...baseOptions,
    width: Math.max(...widths),
  });

  return {
    rel: "preload",
    as: "image",
    href: fallbackUrl,
    // Only include srcset/sizes in production where transformations work
    ...(srcSet && {
      imagesrcset: srcSet,
      imagesizes: sizes ?? defaultSizes,
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Specialized Image URL Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get optimized URL for avatar/profile images with face detection.
 *
 * Uses AI-powered face detection to keep faces centered in the crop.
 *
 * @param src - Absolute image URL
 * @param size - Square size in pixels (default: 200)
 * @returns Optimized URL with face-aware cropping
 *
 * @example
 * <img src={getAvatarUrl(user.avatar, 100)} alt={user.name} />
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

/**
 * Get optimized URL for product images with optional background removal.
 *
 * @param src - Absolute image URL
 * @param options - Configuration options
 * @returns Optimized URL
 *
 * @example
 * // Standard product image
 * <img src={getProductImageUrl(product.image)} />
 *
 * // With background removed
 * <img src={getProductImageUrl(product.image, { removeBackground: true })} />
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

/**
 * Get optimized URL for Open Graph / social sharing images.
 *
 * Returns image at standard OG dimensions (1200x630) with high quality.
 *
 * @param src - Absolute image URL
 * @returns Optimized URL for OG images
 */
export function getOgImageUrl(src: string | null | undefined): string {
  return getOptimizedImageUrl(src, {
    width: 1200,
    height: 630,
    fit: "cover",
    gravity: "auto",
    quality: 90, // Higher quality for social sharing
    format: "jpeg", // JPEG for maximum compatibility
  });
}

/**
 * Get grayscale version of an image.
 *
 * @param src - Absolute image URL
 * @param width - Optional width constraint
 * @returns Optimized grayscale URL
 */
export function getGrayscaleImageUrl(
  src: string | null | undefined,
  width?: number,
): string {
  return getOptimizedImageUrl(src, {
    width,
    saturation: 0, // 0 saturation = grayscale
    sharpen: 1,
  });
}
