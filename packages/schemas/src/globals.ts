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
// DROPSHIPPING INFO PAGE GLOBAL
// ============================================

export const dropshippingInfoPageSchema = z.object({
  title: z.string(),
  description: z.string(),
  youtubeUrl: z.string().nullable(),
});

// ============================================
// DROPSHIPPING SITES PAGE GLOBAL
// ============================================

export const dropshippingSitesPageSchema = z.object({
  title: z.string(),
  description: z.string(),
});

// ============================================
// INFORMATIONS PAGE GLOBAL
// ============================================

export const seoSchema = z.object({
  metaTitle: z.string().nullish(), // Can be null, undefined, or string
  metaDescription: z.string().nullish(),
});

// Lexical rich text content - using any to avoid serialization issues with TanStack Start
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lexicalContentSchema = z.any().nullable();

export const informationsPageSchema = z.object({
  title: z.string(),
  content: lexicalContentSchema, // Lexical rich text content
  seo: seoSchema.nullable(),
});

// ============================================
// SUGGESTION PAGE GLOBAL
// ============================================

export const suggestionPageSchema = z.object({
  title: z.string(),
  description: z.string(),
  formEnabled: z.boolean(),
  seo: seoSchema.nullable(),
});

// ============================================
// TYPES
// ============================================

export type SocialNetworkItem = z.infer<typeof socialNetworkItemSchema>;
export type SocialNetworks = z.infer<typeof socialNetworksSchema>;
export type Homepage = z.infer<typeof homepageSchema>;
export type DropshippingInfoPage = z.infer<typeof dropshippingInfoPageSchema>;
export type DropshippingSitesPage = z.infer<typeof dropshippingSitesPageSchema>;
export type Seo = z.infer<typeof seoSchema>;
export type InformationsPage = z.infer<typeof informationsPageSchema>;
export type SuggestionPage = z.infer<typeof suggestionPageSchema>;
