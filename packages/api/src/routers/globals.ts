import {
  socialNetworksSchema,
  informationsPageSchema,
  suggestionPageSchema,
  type SocialNetworks,
  type InformationsPage,
  type SuggestionPage,
} from "@azertykeycaps-app/schemas";

import { publicProcedure, router } from "../index";

const CMS_CACHE_TTL = 604800;

/**
 * Fetch from CMS with API key authentication and optional edge caching
 * Uses Payload's API key format: "users API-Key <key>"
 * When cacheTtl is provided, uses Cloudflare's edge cache via cf options
 */
function fetchCMS(url: string, apiKey: string | undefined, cacheTtl?: number): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["Authorization"] = `users API-Key ${apiKey}`;
  }

  const fetchOptions: RequestInit & { cf?: object } = { headers };

  if (cacheTtl) {
    fetchOptions.cf = {
      cacheTtl,
      cacheEverything: true,
    };
  }

  return fetch(url, fetchOptions);
}

export const globalsRouter = router({
  /**
   * Get social networks global
   */
  socialNetworks: publicProcedure.output(socialNetworksSchema.nullable()).query(async ({ ctx }) => {
    try {
      const response = await fetchCMS(
        `${ctx.env.CMS_API_URL}/api/globals/social-networks`,
        ctx.env.CMS_API_KEY,
        ctx.isDev ? undefined : CMS_CACHE_TTL,
      );

      if (!response.ok) {
        console.error(`CMS API error: ${response.status}`);
        return null;
      }

      const data = (await response.json()) as SocialNetworks;

      const validation = socialNetworksSchema.safeParse(data);
      if (!validation.success) {
        console.error(
          "[globals.socialNetworks] Output validation failed:",
          JSON.stringify(validation.error.issues, null, 2),
        );
      }

      return data;
    } catch (error) {
      console.error("Failed to fetch social networks:", error);
      return null;
    }
  }),

  /**
   * Get informations page global (About page content)
   */
  informationsPage: publicProcedure
    .output(informationsPageSchema.nullable())
    .query(async ({ ctx }) => {
      try {
        const response = await fetchCMS(
          `${ctx.env.CMS_API_URL}/api/globals/informations-page`,
          ctx.env.CMS_API_KEY,
          ctx.isDev ? undefined : CMS_CACHE_TTL,
        );

        if (!response.ok) {
          console.error(`CMS API error: ${response.status}`);
          return null;
        }

        const data = (await response.json()) as InformationsPage;

        const validation = informationsPageSchema.safeParse(data);
        if (!validation.success) {
          console.error(
            "[globals.informationsPage] Output validation failed:",
            JSON.stringify(validation.error.issues, null, 2),
          );
        }

        return data;
      } catch (error) {
        console.error("Failed to fetch informations page:", error);
        return null;
      }
    }),

  /**
   * Get suggestion page global
   */
  suggestionPage: publicProcedure.output(suggestionPageSchema.nullable()).query(async ({ ctx }) => {
    try {
      const response = await fetchCMS(
        `${ctx.env.CMS_API_URL}/api/globals/suggestion-page`,
        ctx.env.CMS_API_KEY,
        ctx.isDev ? undefined : CMS_CACHE_TTL,
      );

      if (!response.ok) {
        console.error(`CMS API error: ${response.status}`);
        return null;
      }

      const data = (await response.json()) as SuggestionPage;

      const validation = suggestionPageSchema.safeParse(data);
      if (!validation.success) {
        console.error(
          "[globals.suggestionPage] Output validation failed:",
          JSON.stringify(validation.error.issues, null, 2),
        );
      }

      return data;
    } catch (error) {
      console.error("Failed to fetch suggestion page:", error);
      return null;
    }
  }),
});
