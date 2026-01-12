import { z } from "zod";

import { articleSchema } from "./articles";
import { keycapProfileRefSchema } from "./profiles";

// ============================================
// PAGINATED RESPONSE FACTORY
// ============================================

export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    docs: z.array(itemSchema),
    totalDocs: z.number(),
    totalPages: z.number(),
    page: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
    error: z.string().nullable(),
  });

// ============================================
// SPECIFIC RESPONSE SCHEMAS
// ============================================

export const articleListResponseSchema = createPaginatedResponseSchema(articleSchema);

export const profileListResponseSchema = z.array(keycapProfileRefSchema);

// ============================================
// TYPES
// ============================================

export type ArticleListResponse = z.infer<typeof articleListResponseSchema>;
export type ProfileListResponse = z.infer<typeof profileListResponseSchema>;
