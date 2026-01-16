import type { SocialNetworks, KeycapProfileRef } from "@azertykeycaps-app/schemas";
import { createFileRoute, Outlet, ErrorComponent } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { serverTRPCClient } from "@/lib/server-trpc";

// Server function to fetch layout data (social networks + profiles for nav)
// Uses module-scoped tRPC client for reduced cold start time
const getLayoutData = createServerFn({ method: "GET" }).handler(async () => {
  const [socialNetworks, profiles] = await Promise.all([
    serverTRPCClient.globals.socialNetworks.query(),
    serverTRPCClient.articles.profiles.query({ limit: 100 }),
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
  shouldReload: false, // Only reload on entry, not on child navigation
  component: AppLayout,
  errorComponent: ({ error }) => {
    // Layout errors are critical - fall back to default error display
    return <ErrorComponent error={error} />;
  },
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
