import { z } from "zod";

import { payloadIdSchema, seoFieldsSchema } from "./common";
import { mediaSchema } from "./media";

export const PROFILE_SHAPES = {
  SCULPTED: "sculpted",
  UNIFORM: "uniform",
} as const;

export const PROFILE_SHAPE_VALUES = Object.values(PROFILE_SHAPES);
export type ProfileShape = (typeof PROFILE_SHAPES)[keyof typeof PROFILE_SHAPES];

export const profileShapeSchema = z.enum([
  PROFILE_SHAPES.SCULPTED,
  PROFILE_SHAPES.UNIFORM,
]);

export const keycapProfileRefSchema = z.object({
  id: payloadIdSchema,
  title: z.string(),
  slug: z.string(),
  abbreviation: z.string(),
  navbarDescription: z.string(),
  shape: profileShapeSchema,
});

export const keycapProfileSchema = z
  .object({
    id: payloadIdSchema,
    title: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    abbreviation: z.string(),
    navbarDescription: z.string(),
    thumbnail: mediaSchema.nullable(),
    shape: profileShapeSchema,
    navbarIconName: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .merge(seoFieldsSchema);

export type KeycapProfileRef = z.infer<typeof keycapProfileRefSchema>;
export type KeycapProfile = z.infer<typeof keycapProfileSchema>;
