import type { HomePageDataResponse } from "@azertykeycaps-app/schemas";
import { createServerFn } from "@tanstack/react-start";

import { serverEnv } from "@/lib/server-env";

/**
 * Server function to fetch homepage data from aggregated endpoint.
 * This replaces multiple tRPC calls with a single HTTP request,
 * fetching all CMS data in parallel on the server.
 *
 * Returns: articles (latest 4 with formatted dates), homepage content
 *
 * Throws on error to show error UI.
 */
export const getHomePageData = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomePageDataResponse> => {
    const response = await fetch(`${serverEnv.SERVER_URL}/api/pages/home`);

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage data: ${response.status}`);
    }

    return response.json();
  },
);
