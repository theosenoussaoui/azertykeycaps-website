import { z } from "zod";

// ============================================
// MEDIA SCHEMAS
// ============================================

const imageSizeSchema = z.object({
  url: z.string().nullish(),
  width: z.number().nullish(),
  height: z.number().nullish(),
  filename: z.string().nullish(),
  filesize: z.number().nullish(),
  mimeType: z.string().nullish(),
});

export const mediaSchema = z.object({
  url: z.string(),
  alt: z.string(),
  width: z.number().nullish(),
  height: z.number().nullish(),
  sizes: z
    .object({
      thumbnail: imageSizeSchema.nullish(),
      card: imageSizeSchema.nullish(),
    })
    .nullish(),
});

export type Media = z.infer<typeof mediaSchema>;
