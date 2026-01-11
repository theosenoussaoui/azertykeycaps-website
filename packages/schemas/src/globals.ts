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
// TYPES
// ============================================

export type SocialNetworkItem = z.infer<typeof socialNetworkItemSchema>;
export type SocialNetworks = z.infer<typeof socialNetworksSchema>;
export type Homepage = z.infer<typeof homepageSchema>;
export type DropshippingInfoPage = z.infer<typeof dropshippingInfoPageSchema>;
export type DropshippingSitesPage = z.infer<typeof dropshippingSitesPageSchema>;
