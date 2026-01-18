import { z } from "zod";

import { mediaSchema } from "./media";

// ============================================
// CONSTANTS (i18n keys)
// ============================================

export const PROFILE_SHAPES = {
  SCULPTED: "sculpted",
  UNIFORM: "uniform",
} as const;

export const PROFILE_SHAPE_VALUES = Object.values(PROFILE_SHAPES);
export type ProfileShape = (typeof PROFILE_SHAPES)[keyof typeof PROFILE_SHAPES];

// ============================================
// SCHEMAS
// ============================================

export const profileShapeSchema = z.enum([
  PROFILE_SHAPES.SCULPTED,
  PROFILE_SHAPES.UNIFORM,
]);

// Reference schema (when populated in relationships)
export const keycapProfileRefSchema = z.object({
  id: z.coerce.string(),
  title: z.string(),
  slug: z.string(),
  abbreviation: z.string(),
  navbarDescription: z.string(),
  shape: profileShapeSchema,
});

// Full profile schema
export const keycapProfileSchema = z.object({
  id: z.coerce.string(),
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
});

// ============================================
// TYPES
// ============================================

export type KeycapProfileRef = z.infer<typeof keycapProfileRefSchema>;
export type KeycapProfile = z.infer<typeof keycapProfileSchema>;
