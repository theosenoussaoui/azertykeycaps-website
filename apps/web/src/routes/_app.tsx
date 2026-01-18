import type { KeycapProfileRef, SocialNetworks } from "@azertykeycaps-app/schemas";
import { createFileRoute, ErrorComponent, Outlet } from "@tanstack/react-router";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { getLayoutData } from "@/features/globals/api/get-layout-data";

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
  staleTime: 10 * 60_000,
  gcTime: 60 * 60_000,
  shouldReload: false,
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
