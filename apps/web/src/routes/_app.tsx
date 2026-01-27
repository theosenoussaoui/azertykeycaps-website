import type {
  KeycapProfileRef,
  NotFoundPage,
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
import { getNotFoundContent } from "@/features/globals/api/get-not-found-content";
import { buildCacheHeaders } from "@/lib/cache-tags";

export interface AppLayoutContext {
  socialNetworks: SocialNetworks | null;
  profiles: KeycapProfileRef[];
  notFoundContent: NotFoundPage | null;
}

export const Route = createFileRoute("/_app")({
  loader: async (): Promise<AppLayoutContext> => {
    const [layoutData, notFoundContent] = await Promise.all([
      getLayoutData(),
      getNotFoundContent(),
    ]);
    return {
      socialNetworks: layoutData.socialNetworks,
      profiles: layoutData.profiles,
      notFoundContent,
    };
  },
  headers: () => buildCacheHeaders({}),
  staleTime: 10 * 60_000,
  gcTime: 60 * 60_000,
  shouldReload: false,
  component: AppLayout,
  errorComponent: ({ error }) => {
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
