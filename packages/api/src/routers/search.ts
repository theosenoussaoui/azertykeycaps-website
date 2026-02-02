import {
  searchInputSchema,
  searchResponseSchema,
  type SearchResponse,
} from "@azertykeycaps-app/schemas";
import { stringify } from "qs-esm";

import { publicProcedure, router } from "../index";

/**
 * Search router for querying Payload's search plugin collection.
 * Client-exposed for interactive search UI (Command palette).
 */
export const searchRouter = router({
  /**
   * Search articles and profiles via Payload's search plugin.
   * Returns results sorted by priority (profiles first, then articles).
   */
  query: publicProcedure
    .input(searchInputSchema)
    .output(searchResponseSchema)
    .query(async ({ ctx, input }): Promise<SearchResponse> => {
      const { q, limit } = input;

      try {
        const queryString = stringify(
          {
            where: {
              title: { contains: q },
            },
            limit,
            depth: 0,
            sort: "-priority", // Higher priority first (profiles > articles)
          },
          { addQueryPrefix: true },
        );

        const response = await fetch(
          `${ctx.env.CMS_API_URL}/api/search${queryString}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(ctx.env.CMS_API_KEY && {
                Authorization: `users API-Key ${ctx.env.CMS_API_KEY}`,
              }),
            },
          },
        );

        if (!response.ok) {
          console.error("[search.query] CMS error:", response.status);
          return { docs: [], totalDocs: 0, hasNextPage: false };
        }

        const data = await response.json();

        const parsed = searchResponseSchema.safeParse(data);
        if (!parsed.success) {
          console.error(
            "[search.query] Validation failed:",
            parsed.error.issues,
          );
          return { docs: [], totalDocs: 0, hasNextPage: false };
        }

        return parsed.data;
      } catch (error) {
        console.error("[search.query] Failed:", error);
        return { docs: [], totalDocs: 0, hasNextPage: false };
      }
    }),
});
