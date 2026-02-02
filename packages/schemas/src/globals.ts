import { z } from "zod";

import { seoFieldsSchema } from "./common";
import { keycapProfileRefSchema } from "./profiles";

export const socialNetworkItemSchema = z.object({
  title: z.string(),
  url: z.string(),
  iconText: z.string().nullable(),
});

export const socialNetworksSchema = z.object({
  networks: z.array(socialNetworkItemSchema),
});

export const homepageSchema = z
  .object({
    title: z.string().nullish(),
    subtitle: z.string().nullish(),
    profileCards: z.array(keycapProfileRefSchema).nullish(),
  })
  .merge(seoFieldsSchema);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lexicalContentSchema = z.any().nullable();

export const informationsPageSchema = z
  .object({
    title: z.string(),
    content: lexicalContentSchema,
  })
  .merge(seoFieldsSchema);

export const suggestionPageSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    formEnabled: z.boolean(),
  })
  .merge(seoFieldsSchema);

export const notFoundPageSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    ctaText: z.string(),
  })
  .merge(seoFieldsSchema);

export type SocialNetworkItem = z.infer<typeof socialNetworkItemSchema>;
export type SocialNetworks = z.infer<typeof socialNetworksSchema>;
export type Homepage = z.infer<typeof homepageSchema>;
export type InformationsPage = z.infer<typeof informationsPageSchema>;
export type SuggestionPage = z.infer<typeof suggestionPageSchema>;
export type NotFoundPage = z.infer<typeof notFoundPageSchema>;
