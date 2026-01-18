import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { createServerFn } from "@tanstack/react-start";

import { getUser } from "@/features/auth/api/get-user";

/**
 * Server function to fetch private user data.
 * Uses direct tRPC caller (not HTTP) for secure server-side execution.
 *
 * This is NEVER exposed to the client - no API endpoint visible in browser.
 */
export const getPrivateData = createServerFn({ method: "GET" }).handler(async () => {
  // Get session from server-side auth
  const session = await getUser();

  // Create tRPC caller with session in context
  const caller = appRouter.createCaller({
    session,
    env: process.env as unknown as Env,
    isDev: process.env.NODE_ENV !== "production",
  });

  // Call tRPC procedure - happens server-side only with auth
  return await caller.privateData();
});
