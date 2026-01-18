import { z } from "zod";

export const cacheInvalidationPayloadSchema = z.object({
  type: z.enum(["collection", "global"]),
  slug: z.string().min(1),
  id: z.string().optional(),
  articleSlug: z.string().optional(),
  profileSlug: z.string().optional(),
  relatedArticleSlugs: z.array(z.string()).optional(),
});

export type CacheInvalidationPayload = z.infer<typeof cacheInvalidationPayloadSchema>;
