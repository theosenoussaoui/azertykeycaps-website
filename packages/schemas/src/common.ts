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
// TYPES
// ============================================

export type PayloadId = z.infer<typeof payloadIdSchema>;
