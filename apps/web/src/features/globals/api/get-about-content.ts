import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

/**
 * Server function to fetch about page content from CMS.
 * Uses module-scoped tRPC client for reduced cold start time.
 */
export const getAboutContent = createServerFn({ method: "GET" }).handler(async () => {
  return await serverTRPCClient.globals.informationsPage.query();
});
