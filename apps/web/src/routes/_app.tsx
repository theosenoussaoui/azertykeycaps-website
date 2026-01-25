import type {
  KeycapProfileRef,
  SocialNetworks,
} from "@azertykeycaps-app/schemas";
import {
  createFileRoute,
  ErrorComponent,
  Outlet,
} from "@tanstack/react-router";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { GridLines } from "@/components/ui/grid-lines";
import { getLayoutData } from "@/features/globals/api/get-layout-data";
import { buildCacheHeaders } from "@/lib/cache-tags";

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
  headers: () => buildCacheHeaders({}),
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
    <div className="relative flex min-h-svh flex-col">
      <GridLines />
      <Header profiles={profiles} />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer socialNetworks={socialNetworks} />
    </div>
  );
}
