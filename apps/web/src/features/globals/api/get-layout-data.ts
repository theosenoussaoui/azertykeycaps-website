import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

/**
 * Server function to fetch layout data (social networks + profiles for nav).
 * Uses module-scoped tRPC client for reduced cold start time.
 */
export const getLayoutData = createServerFn({ method: "GET" }).handler(
  async () => {
    const [socialNetworks, profiles] = await Promise.all([
      serverTRPCClient.globals.socialNetworks.query(),
      serverTRPCClient.articles.profiles.query({ limit: 100 }),
    ]);

    return {
      socialNetworks,
      profiles,
    };
  },
);
