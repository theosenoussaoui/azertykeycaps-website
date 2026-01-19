import type { AppRouter } from "@azertykeycaps-app/api/routers/index";
import { createTRPCContext } from "@trpc/tanstack-react-query";

/**
 * Client-side tRPC context for React Query integration.
 * Provides type-safe hooks for making tRPC calls from React components.
 *
 * Usage:
 * ```tsx
 * const trpc = useTRPC();
 * const query = useQuery(trpc.search.query.queryOptions({ q: "..." }));
 * ```
 */
export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
