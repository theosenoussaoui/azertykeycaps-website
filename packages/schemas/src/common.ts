import { z } from "zod";

// ============================================
// COMMON SCHEMA UTILITIES
// ============================================

/**
 * Payload ID schema that handles both string and numeric IDs.
 *
 * Payload with D1/SQLite adapter returns numeric IDs, but we normalize
 * them to strings for consistent handling across the application.
 *
 * Use this for all `id` fields from Payload responses.
 */
export const payloadIdSchema = z.coerce.string();

/**
 * Optional Payload ID schema (for nullable relationships).
 */
export const payloadIdOptionalSchema = z.coerce.string().optional();

/**
 * Payload timestamp schema (ISO 8601 string).
 */
export const payloadTimestampSchema = z.string();

// ============================================
// SEO SCHEMA
// ============================================

/**
 * SEO fields schema for CMS-managed meta data.
 *
 * Matches the field structure from @payloadcms/plugin-seo:
 * - meta.title: Custom title for search engines (50-60 chars recommended)
 * - meta.description: Custom description for search results (150-160 chars)
 * - meta.image: Custom Open Graph image for social sharing (media reference)
 *
 * All fields are optional and fall back to content fields when not provided.
 */
export const seoFieldsSchema = z.object({
  meta: z
    .object({
      title: z.string().nullish(),
      description: z.string().nullish(),
      image: z
        .object({
          url: z.string(),
          alt: z.string().optional(),
          width: z.number().nullish(),
          height: z.number().nullish(),
        })
        .nullish(),
    })
    .nullish(),
});

export type SeoFields = z.infer<typeof seoFieldsSchema>;

// ============================================
// TYPES
// ============================================

export type PayloadId = z.infer<typeof payloadIdSchema>;
