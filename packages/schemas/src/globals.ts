import { z } from "zod";

import { keycapProfileRefSchema } from "./profiles";

// ============================================
// SOCIAL NETWORKS GLOBAL
// ============================================

export const socialNetworkItemSchema = z.object({
  title: z.string(),
  url: z.string(),
  iconText: z.string().nullable(),
});

export const socialNetworksSchema = z.object({
  networks: z.array(socialNetworkItemSchema),
});

// ============================================
// HOMEPAGE GLOBAL
// ============================================

export const homepageSchema = z.object({
  title: z.string(),
  description: z.string(),
  profileCards: z.array(keycapProfileRefSchema),
});

// ============================================
// INFORMATIONS PAGE GLOBAL
// ============================================

// Lexical rich text content - using any to avoid serialization issues with TanStack Start
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lexicalContentSchema = z.any().nullable();

export const informationsPageSchema = z.object({
  title: z.string(),
  content: lexicalContentSchema,
  metaTitle: z.string().nullish(),
  metaDescription: z.string().nullish(),
});

// ============================================
// SUGGESTION PAGE GLOBAL
// ============================================

export const suggestionPageSchema = z.object({
  title: z.string(),
  description: z.string(),
  formEnabled: z.boolean(),
  metaTitle: z.string().nullish(),
  metaDescription: z.string().nullish(),
});

// ============================================
// TYPES
// ============================================

export type SocialNetworkItem = z.infer<typeof socialNetworkItemSchema>;
export type SocialNetworks = z.infer<typeof socialNetworksSchema>;
export type Homepage = z.infer<typeof homepageSchema>;
export type InformationsPage = z.infer<typeof informationsPageSchema>;
export type SuggestionPage = z.infer<typeof suggestionPageSchema>;
