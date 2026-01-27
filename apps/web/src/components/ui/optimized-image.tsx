import {
  generateSrcSet,
  getOptimizedImageUrl,
  RESPONSIVE_WIDTHS,
  SLOW_CONNECTION_QUALITY,
  type ImageTransformOptions,
} from "@/lib/image-utils";

export interface OptimizedImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet"
> {
  /** Source URL of the image (absolute URL from CMS) */
  src: string | null | undefined;
  /** Alt text for accessibility */
  alt: string;
  /**
   * Array of widths for responsive srcset generation.
   * Use RESPONSIVE_WIDTHS presets or provide custom widths.
   * @default RESPONSIVE_WIDTHS.card
   */
  widths?: readonly number[];
  /**
   * CSS sizes attribute for responsive images.
   * Describes how wide the image will be at different viewport sizes.
   * @example "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
   */
  sizes?: string;
  /**
   * Mark as priority/LCP image.
   * Sets loading="eager", fetchPriority="high", and decoding="sync".
   * Use for above-the-fold images that are critical for LCP.
   * @default false
   */
  priority?: boolean;
  /**
   * Explicit width for the largest variant.
   * Used when you want a specific size instead of responsive srcset.
   */
  width?: number;
  /**
   * Explicit height for aspect ratio calculation.
   * Helps prevent layout shift (CLS).
   */
  height?: number;
  /**
   * Additional Cloudflare Images transformation options.
   * Applied to all generated variants.
   */
  transformOptions?: Omit<ImageTransformOptions, "width" | "height">;
  /**
   * Enable adaptive quality for slow connections.
   * Reduces quality on 2G/3G networks for faster loading.
   * @default true
   */
  adaptiveQuality?: boolean;
  /**
   * Apply sharpening to downscaled images.
   * Recommended for most images to maintain crispness.
   * @default true
   */
  sharpen?: boolean;
  /**
   * Fallback to original image on transformation error.
   * Only works for same-domain images.
   * @default false
   */
  fallbackOnError?: boolean;
}

/**
 * Optimized image component using Cloudflare Images transformations.
 *
 * Automatically generates responsive srcset with WebP/AVIF conversion,
 * proper loading strategies, and layout shift prevention.
 *
 * @example
 * // Responsive card image
 * <OptimizedImage
 *   src={article.img.url}
 *   alt={article.img.alt}
 *   widths={RESPONSIVE_WIDTHS.card}
 *   sizes="(max-width: 640px) 100vw, 50vw"
 *   width={768}
 *   height={432}
 * />
 *
 * @example
 * // Priority hero image (LCP)
 * <OptimizedImage
 *   src={article.img.url}
 *   alt={article.img.alt}
 *   widths={RESPONSIVE_WIDTHS.hero}
 *   priority
 *   width={1200}
 *   height={675}
 * />
 *
 * @example
 * // Image with face-aware cropping (avatar)
 * <OptimizedImage
 *   src={user.avatar}
 *   alt={user.name}
 *   width={200}
 *   height={200}
 *   transformOptions={{ gravity: "face", fit: "cover" }}
 * />
 */
export function OptimizedImage({
  src,
  alt,
  widths = RESPONSIVE_WIDTHS.card,
  sizes,
  priority = false,
  width,
  height,
  transformOptions = {},
  adaptiveQuality = true,
  sharpen = true,
  fallbackOnError = false,
  className,
  ...props
}: OptimizedImageProps) {
  if (!src) {
    return null;
  }

  // Build the base options for all variants
  const baseOptions: Omit<ImageTransformOptions, "width"> = {
    ...transformOptions,
    // Add sharpening for downscaled images (recommended by Cloudflare)
    ...(sharpen && !transformOptions.sharpen && { sharpen: 1 }),
    // Enable adaptive quality for slow connections
    ...(adaptiveQuality &&
      !transformOptions.slowConnectionQuality && {
        slowConnectionQuality: SLOW_CONNECTION_QUALITY,
      }),
    // Add error fallback if requested
    ...(fallbackOnError &&
      !transformOptions.onerror && { onerror: "redirect" }),
  };

  // Generate srcset for responsive images
  const srcSet = generateSrcSet(src, widths, baseOptions);

  // Use the largest width as the fallback src
  const fallbackWidth = width ?? Math.max(...widths);
  const fallbackSrc = getOptimizedImageUrl(src, {
    ...baseOptions,
    width: fallbackWidth,
  });

  return (
    <img
      src={fallbackSrc}
      srcSet={srcSet || undefined}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      className={className}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Specialized Image Components
// ─────────────────────────────────────────────────────────────────────────────

export interface AvatarImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> {
  /** Source URL of the avatar image */
  src: string | null | undefined;
  /** Alt text (typically person's name) */
  alt: string;
  /** Size in pixels (square) */
  size?: number;
}

/**
 * Avatar image component with face-aware cropping.
 *
 * Uses AI-powered face detection to keep faces centered in the crop.
 *
 * @example
 * <AvatarImage src={user.avatar} alt={user.name} size={80} />
 */
export function AvatarImage({
  src,
  alt,
  size = 80,
  className,
  ...props
}: AvatarImageProps) {
  if (!src) {
    return null;
  }

  const optimizedSrc = getOptimizedImageUrl(src, {
    width: size,
    height: size,
    fit: "cover",
    gravity: "face",
    zoom: 0.3,
    sharpen: 1,
  });

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={className}
      {...props}
    />
  );
}

// Re-export utilities and constants for convenience
export {
  RESPONSIVE_WIDTHS,
  getOptimizedImageUrl,
  generateSrcSet,
  getPreloadLinkAttributes,
  getAvatarUrl,
  getProductImageUrl,
  getOgImageUrl,
  getGrayscaleImageUrl,
} from "@/lib/image-utils";
