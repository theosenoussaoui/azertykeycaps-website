import { TRPCError } from "@trpc/server";
import { stringify } from "qs-esm";

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

import { publicProcedure, router } from "../index";

// Transform CMS media URLs to use the server proxy
function transformMediaUrls<T>(data: T, serverUrl: string): T {
  const json = JSON.stringify(data);
  // Replace relative /api/media/ URLs with absolute server URLs
  const transformed = json.replace(
    /"\/api\/media\//g,
    `"${serverUrl}/api/media/`
  );
  return JSON.parse(transformed);
}

export const articlesRouter = router({
  /**
   * List articles with pagination and filters
   */
  list: publicProcedure
    .input(articleListInputSchema)
    .output(articleListResponseSchema)
    .query(async ({ ctx, input }): Promise<ArticleListResponse> => {
      const { limit, page, profile, status, material, isNew, search } = input;

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
        const queryString = stringify(
          {
            limit,
            page,
            depth: 1,
            sort: "-createdAt",
            ...(Object.keys(where).length > 0 && { where }),
          },
          { addQueryPrefix: true }
        );

        const response = await fetch(`${ctx.env.CMS_API_URL}/api/articles${queryString}`);

        if (!response.ok) {
          console.error(`CMS API error: ${response.status}`);
          return {
            docs: [],
            totalDocs: 0,
            totalPages: 0,
            page: 1,
            hasNextPage: false,
            hasPrevPage: false,
            error: "Failed to fetch articles from CMS",
          };
        }

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
          console.error("[articles.list] Output validation failed:", JSON.stringify(validation.error.issues, null, 2));
        }

        return output;
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        return {
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page: 1,
          hasNextPage: false,
          hasPrevPage: false,
          error: error instanceof Error ? error.message : "Unknown error",
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
        const queryString = stringify(
          {
            where: {
              slug: { equals: slug },
            },
            depth: 1,
            limit: 1,
          },
          { addQueryPrefix: true }
        );

        const response = await fetch(`${ctx.env.CMS_API_URL}/api/articles${queryString}`);

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
   */
  profiles: publicProcedure
    .input(profileListInputSchema)
    .output(profileListResponseSchema)
    .query(async ({ ctx, input }) => {
      try {
        // Use qs-esm to properly format query string for Payload REST API
        const queryString = stringify(
          {
            limit: input.limit,
            sort: "title",
          },
          { addQueryPrefix: true }
        );

        const response = await fetch(
          `${ctx.env.CMS_API_URL}/api/keycap-profiles${queryString}`,
        );

        if (!response.ok) {
          console.error(`CMS API error: ${response.status}`);
          return [];
        }

        const data = (await response.json()) as { docs: KeycapProfileRef[] };

        // Validate before returning to catch schema mismatches
        const validation = profileListResponseSchema.safeParse(data.docs);
        if (!validation.success) {
          console.error("[articles.profiles] Output validation failed:", JSON.stringify(validation.error.issues, null, 2));
        }

        return data.docs;
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        return [];
      }
    }),
});
