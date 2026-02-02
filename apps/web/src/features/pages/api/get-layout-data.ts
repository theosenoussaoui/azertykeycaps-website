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
    const url = `${serverEnv.SERVER_URL}/api/pages/layout`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch layout data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Layout data request timed out");
      }
      throw error;
    }
  },
);
