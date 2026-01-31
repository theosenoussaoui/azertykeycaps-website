import type { LayoutDataResponse } from "@azertykeycaps-app/schemas";
import { createServerFn } from "@tanstack/react-start";

import { serverEnv } from "@/lib/server-env";

/**
 * Server function to fetch root layout data from aggregated endpoint.
 * This replaces multiple tRPC calls with a single HTTP request,
 * fetching all CMS data in parallel on the server.
 *
 * Returns: socialNetworks, profiles, notFoundPage
 *
 * Throws on error to show error UI.
 */
export const getLayoutData = createServerFn({ method: "GET" }).handler(
  async (): Promise<LayoutDataResponse> => {
    const response = await fetch(`${serverEnv.SERVER_URL}/api/pages/layout`);

    if (!response.ok) {
      throw new Error(`Failed to fetch layout data: ${response.status}`);
    }

    return response.json();
  },
);
