import {
  articleListInputSchema,
  articleBySlugInputSchema,
  profileListInputSchema,
  articleListResponseSchema,
  articleSchema,
  profileListResponseSchema,
  type Article,
  type ArticleListResponse,
  type KeycapProfileRef,
} from "@azertykeycaps-app/schemas";
import { TRPCError } from "@trpc/server";
import { stringify } from "qs-esm";

import { publicProcedure, router } from "../index";

// Transform CMS media URLs to use the server proxy
function transformMediaUrls<T>(data: T, serverUrl: string): T {
  const json = JSON.stringify(data);
  // Replace relative /api/media/ URLs with absolute server URLs
  const transformed = json.replace(
    /"\/api\/media\//g,
    `"${serverUrl}/api/media/`,
  );
  return JSON.parse(transformed);
}

/**
 * CMS fetch error with detailed information
 */
class CMSError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NETWORK_ERROR"
      | "AUTH_ERROR"
      | "NOT_FOUND"
      | "SERVER_ERROR"
      | "UNKNOWN",
    public readonly status?: number,
    public readonly url?: string,
  ) {
    super(message);
    this.name = "CMSError";
  }
}

// Disabled: cf.cacheTtl subrequest cache can't be purged via Cloudflare API
// Relying on CDN cache for HTML pages instead (purged on content change)
const CMS_CACHE_TTL = 0;

/**
 * Fetch from CMS with API key authentication and optional edge caching
 * Uses Payload's API key format: "users API-Key <key>"
 * When cacheTtl is provided, uses Cloudflare's edge cache via cf options
 */
async function fetchCMS(
  url: string,
  apiKey: string | undefined,
  cacheTtl?: number,
): Promise<Response> {
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

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorBody = await response
        .text()
        .catch(() => "Unable to read error body");
      console.error("[CMS] Error response body:", errorBody);

      if (response.status === 401 || response.status === 403) {
        throw new CMSError(
          `CMS authentication failed: ${errorBody}`,
          "AUTH_ERROR",
          response.status,
          url,
        );
      }
      if (response.status === 404) {
        throw new CMSError(
          `CMS endpoint not found: ${url}`,
          "NOT_FOUND",
          response.status,
          url,
        );
      }
      if (response.status >= 500) {
        throw new CMSError(
          `CMS server error: ${errorBody}`,
          "SERVER_ERROR",
          response.status,
          url,
        );
      }
      throw new CMSError(
        `CMS request failed: ${response.status} - ${errorBody}`,
        "UNKNOWN",
        response.status,
        url,
      );
    }

    return response;
  } catch (error) {
    if (error instanceof CMSError) throw error;

    // Network-level errors (connection refused, DNS failure, etc.)
    const message =
      error instanceof Error ? error.message : "Unknown network error";
    console.error("[CMS] Network error:", message);
    console.error("[CMS] Full error:", error);

    throw new CMSError(
      `CMS network error: ${message}`,
      "NETWORK_ERROR",
      undefined,
      url,
    );
  }
}

export const articlesRouter = router({
  /**
   * List articles with pagination and filters
   * Input is optional - defaults are applied when no input provided
   */
  list: publicProcedure
    .input(articleListInputSchema.optional())
    .output(articleListResponseSchema)
    .query(async ({ ctx, input }): Promise<ArticleListResponse> => {
      // Safely parse and apply defaults from schema (limit: 12, page: 1)
      const parsed = articleListInputSchema.safeParse(input ?? {});
      if (!parsed.success) {
        console.error(
          "[articles.list] Input validation failed:",
          parsed.error.issues,
        );
        return {
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page: 1,
          hasNextPage: false,
          hasPrevPage: false,
          error: "Invalid input parameters",
        };
      }
      const { limit, page, profile, status, material, isNew, search } =
        parsed.data;

      try {
        // Build where clause using Payload query format
        const where: Record<string, unknown> = {};

        if (profile) {
          // Query nested relationship field
          where["profile.slug"] = { equals: profile };
        }
        if (status) {
          where.status = { equals: status };
        }
        if (material) {
          where.material = { equals: material };
        }
        if (isNew !== undefined) {
          where.isNew = { equals: isNew };
        }
        if (search) {
          where.title = { contains: search };
        }

        // Use qs-esm to properly format query string for Payload REST API
        // Using select to only fetch fields needed for article cards (performance optimization)
        const queryString = stringify(
          {
            limit,
            page,
            depth: 1,
            sort: "-createdAt",
            ...(Object.keys(where).length > 0 && { where }),
            // Only select fields needed for article list/cards
            select: {
              id: true,
              title: true,
              slug: true,
              img: true,
              profile: true,
              status: true,
              isNew: true,
            },
          },
          { addQueryPrefix: true },
        );

        const response = await fetchCMS(
          `${ctx.env.CMS_API_URL}/api/articles${queryString}`,
          ctx.env.CMS_API_KEY,
          ctx.isDev ? undefined : CMS_CACHE_TTL,
        );

        const data = (await response.json()) as ArticleListResponse;

        // Transform media URLs to use server proxy
        const transformedData = transformMediaUrls(data, ctx.env.SERVER_URL);

        const output = {
          ...transformedData,
          error: null,
        };

        // Validate before returning to catch schema mismatches
        const validation = articleListResponseSchema.safeParse(output);
        if (!validation.success) {
          console.error(
            "[articles.list] Output validation failed:",
            JSON.stringify(validation.error.issues, null, 2),
          );
        }

        return output;
      } catch (error) {
        console.error("[articles.list] Failed:", error);

        let errorMessage = "Unknown error";
        if (error instanceof CMSError) {
          errorMessage = `[${error.code}] ${error.message}`;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        return {
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page: 1,
          hasNextPage: false,
          hasPrevPage: false,
          error: errorMessage,
        };
      }
    }),

  /**
   * Get a single article by slug
   */
  bySlug: publicProcedure
    .input(articleBySlugInputSchema)
    .output(articleSchema.nullable())
    .query(async ({ ctx, input }) => {
      const { slug } = input;

      try {
        // Use qs-esm to properly format query string for Payload REST API
        // Using limit: 1 + pagination: false for optimized unique field query
        const queryString = stringify(
          {
            where: {
              slug: { equals: slug },
            },
            depth: 1,
            limit: 1,
            pagination: false, // Skip pagination overhead for unique queries
          },
          { addQueryPrefix: true },
        );

        const response = await fetchCMS(
          `${ctx.env.CMS_API_URL}/api/articles${queryString}`,
          ctx.env.CMS_API_KEY,
          ctx.isDev ? undefined : CMS_CACHE_TTL,
        );

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch article from CMS",
          });
        }

        const data = (await response.json()) as { docs: Article[] };
        const article = data.docs[0] ?? null;

        if (!article) return null;

        // Transform media URLs to use server proxy
        return transformMediaUrls(article, ctx.env.SERVER_URL);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Failed to fetch article:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch article",
        });
      }
    }),

  /**
   * List keycap profiles for filters
   * Input is optional - defaults are applied when no input provided
   */
  profiles: publicProcedure
    .input(profileListInputSchema.optional())
    .output(profileListResponseSchema)
    .query(async ({ ctx, input }) => {
      // Safely parse and apply defaults from schema (limit: 100)
      const parsed = profileListInputSchema.safeParse(input ?? {});
      if (!parsed.success) {
        console.error(
          "[articles.profiles] Input validation failed:",
          parsed.error.issues,
        );
        return [];
      }

      try {
        // Use qs-esm to properly format query string for Payload REST API
        const queryString = stringify(
          {
            limit: parsed.data.limit,
            sort: "title",
          },
          { addQueryPrefix: true },
        );

        const response = await fetchCMS(
          `${ctx.env.CMS_API_URL}/api/keycap-profiles${queryString}`,
          ctx.env.CMS_API_KEY,
          ctx.isDev ? undefined : CMS_CACHE_TTL,
        );

        if (!response.ok) {
          console.error(`CMS API error: ${response.status}`);
          return [];
        }

        const data = (await response.json()) as { docs: KeycapProfileRef[] };

        // Validate before returning to catch schema mismatches
        const validation = profileListResponseSchema.safeParse(data.docs);
        if (!validation.success) {
          console.error(
            "[articles.profiles] Output validation failed:",
            JSON.stringify(validation.error.issues, null, 2),
          );
        }

        return data.docs;
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        return [];
      }
    }),
});
