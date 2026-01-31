import type { AppRouter } from "@azertykeycaps-app/api/routers/index";
import { createTRPCClient, httpLink } from "@trpc/client";

import { serverEnv } from "./server-env";

/**
 * Server-side tRPC client for use in TanStack Start server functions.
 *
 * Initialized at module scope to reduce cold start time on Cloudflare Workers.
 * The client is stateless and can be safely reused across requests.
 *
 * IMPORTANT: Uses httpLink instead of httpBatchLink to avoid Cloudflare Workers
 * cross-request promise resolution warnings. With aggregated page data endpoints
 * (/api/pages/*), batching is handled server-side anyway.
 *
 * @see https://developers.cloudflare.com/workers/examples/cold-start-optimization/
 */
export const serverTRPCClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${serverEnv.SERVER_URL}/trpc`,
      // Add timeout to prevent hanging requests
      fetch: async (url, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
    }),
  ],
});
