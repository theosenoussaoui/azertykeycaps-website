import type { AppRouter } from "@azertykeycaps-app/api/routers/index";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { serverEnv } from "./server-env";

/**
 * Server-side tRPC client for use in TanStack Start server functions.
 *
 * Initialized at module scope to reduce cold start time on Cloudflare Workers.
 * The client is stateless and can be safely reused across requests.
 *
 * @see https://developers.cloudflare.com/workers/examples/cold-start-optimization/
 */
export const serverTRPCClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${serverEnv.SERVER_URL}/trpc`,
    }),
  ],
});
