import {
  generateSrcSet,
  getOptimizedImageUrl,
  RESPONSIVE_WIDTHS,
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
  className,
  ...props
}: OptimizedImageProps) {
  if (!src) {
    return null;
  }

  // Generate srcset for responsive images
  const srcSet = generateSrcSet(src, widths, transformOptions);

  // Use the largest width as the fallback src
  const fallbackWidth = width ?? Math.max(...widths);
  const fallbackSrc = getOptimizedImageUrl(src, {
    ...transformOptions,
    width: fallbackWidth,
  });

  return (
    <img
      src={fallbackSrc}
      srcSet={srcSet}
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

// Re-export utilities and constants for convenience
export { RESPONSIVE_WIDTHS, getOptimizedImageUrl, generateSrcSet } from "@/lib/image-utils";
