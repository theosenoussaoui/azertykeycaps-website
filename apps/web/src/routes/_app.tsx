import type { AppRouter } from "@azertykeycaps-app/api/routers/index";
import type { SocialNetworks, KeycapProfileRef } from "@azertykeycaps-app/schemas";

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { serverEnv } from "@/lib/server-env";

// Create a server-side tRPC client
function createServerTRPCClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${serverEnv.SERVER_URL}/trpc`,
      }),
    ],
  });
}

// Server function to fetch layout data (social networks + profiles for nav)
const getLayoutData = createServerFn({ method: "GET" }).handler(async () => {
  const client = createServerTRPCClient();

  const [socialNetworks, profiles] = await Promise.all([
    client.globals.socialNetworks.query(),
    client.articles.profiles.query({ limit: 100 }),
  ]);

  return {
    socialNetworks,
    profiles,
  };
});

export interface AppLayoutContext {
  socialNetworks: SocialNetworks | null;
  profiles: KeycapProfileRef[];
}

export const Route = createFileRoute("/_app")({
  loader: async (): Promise<AppLayoutContext> => {
    const data = await getLayoutData();
    return {
      socialNetworks: data.socialNetworks,
      profiles: data.profiles,
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 10 * 60_000, // Client considers data fresh for 10 minutes
  gcTime: 60 * 60_000, // Keep in memory for 1 hour
  component: AppLayout,
});

function AppLayout() {
  const { socialNetworks, profiles } = Route.useLoaderData();

  return (
    <div className="flex min-h-svh flex-col">
      <Header profiles={profiles} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer socialNetworks={socialNetworks} />
    </div>
  );
}
