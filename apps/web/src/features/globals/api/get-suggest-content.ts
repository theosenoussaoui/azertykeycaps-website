import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

/**
 * Server function to fetch suggestion page content from CMS.
 * Uses module-scoped tRPC client for reduced cold start time.
 */
export const getSuggestContent = createServerFn({ method: "GET" }).handler(
  async () => {
    return await serverTRPCClient.globals.suggestionPage.query();
  },
);
