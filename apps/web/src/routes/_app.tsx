import type {
  KeycapProfileRef,
  LayoutDataResponse,
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
import { getLayoutData } from "@/features/pages/api/get-layout-data";

export interface AppLoaderData {
  profiles: KeycapProfileRef[];
  socialNetworks: SocialNetworks | null;
  notFoundContent: NotFoundPage | null;
}

function toAppLoaderData(data: LayoutDataResponse): AppLoaderData {
  return {
    profiles: data.profiles,
    socialNetworks: data.socialNetworks,
    notFoundContent: data.notFoundPage,
  };
}

export const Route = createFileRoute("/_app")({
  component: AppLayout,
  loader: async (): Promise<AppLoaderData> => {
    const start = performance.now();
    const data = await getLayoutData();
    console.log(
      `[route:/_app] getLayoutData: ${(performance.now() - start).toFixed(1)}ms`,
    );
    return toAppLoaderData(data);
  },
  errorComponent: ({ error }) => {
    return <ErrorComponent error={error} />;
  },
});

function AppLayout() {
  const { profiles, socialNetworks } = Route.useLoaderData();

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
