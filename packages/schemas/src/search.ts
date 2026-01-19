import { z } from "zod";

import { payloadIdSchema } from "./common";

// ============================================
// SEARCH SCHEMAS (Payload Search Plugin)
// ============================================

/**
 * Search result item from Payload's search plugin.
 * The plugin creates a 'search' collection with indexed documents.
 *
 * Note: Uses payloadIdSchema to handle D1/SQLite numeric IDs,
 * normalizing them to strings for consistent handling.
 */
export const searchResultSchema = z.object({
  id: payloadIdSchema,
  title: z.string(),
  slug: z.string(), // Added via beforeSync in payload.config.ts
  priority: z.number().optional(),
  doc: z.object({
    relationTo: z.enum(["articles", "keycap-profiles"]),
    value: payloadIdSchema, // Referenced document ID
  }),
});

/**
 * Search response from the API.
 * Matches Payload's paginated response format.
 */
export const searchResponseSchema = z.object({
  docs: z.array(searchResultSchema),
  totalDocs: z.number(),
  hasNextPage: z.boolean(),
});

/**
 * Input schema for search query.
 * Used by tRPC procedure for validation.
 */
export const searchInputSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.number().min(1).max(20).default(10),
});

// ============================================
// TYPES
// ============================================

export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type SearchInput = z.infer<typeof searchInputSchema>;
