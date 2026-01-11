import { z } from "zod";

// ============================================
// MEDIA SCHEMAS
// ============================================

export const mediaSchema = z.object({
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type Media = z.infer<typeof mediaSchema>;
