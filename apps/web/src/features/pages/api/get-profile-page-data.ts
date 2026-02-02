import type {
  ProfilePageDataResponse,
  ProfilePageFilters,
} from "@azertykeycaps-app/schemas";
import { createServerFn } from "@tanstack/react-start";

import { serverEnv } from "@/lib/server-env";

type ProfilePageInput = { slug: string } & ProfilePageFilters;

/**
 * Server function to fetch profile page data from aggregated endpoint.
 * Returns: profile (full), articles (paginated/filtered), profileSlug
 *
 * Throws on error to show error UI.
 * Returns null if profile not found (404).
 */
export const getProfilePageData = createServerFn({ method: "GET" })
  .inputValidator((data: ProfilePageInput) => data)
  .handler(async ({ data }): Promise<ProfilePageDataResponse | null> => {
    const { slug, ...filters } = data;

    const params = new URLSearchParams();
    if (filters.page && filters.page !== 1) {
      params.set("page", String(filters.page));
    }
    if (filters.status) params.set("status", filters.status);
    if (filters.material) params.set("material", filters.material);
    if (filters.isNew !== undefined) params.set("isNew", String(filters.isNew));
    if (filters.search) params.set("search", filters.search);

    const queryString = params.toString();
    const url = `${serverEnv.SERVER_URL}/api/pages/profile/${slug}${queryString ? `?${queryString}` : ""}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch profile data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Profile data request timed out");
      }
      throw error;
    }
  });
