import type { RootLoaderData } from "./__root";
import {
  createFileRoute,
  ErrorComponent,
  Outlet,
  rootRouteId,
  useMatch,
} from "@tanstack/react-router";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { GridLines } from "@/components/ui/grid-lines";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
  errorComponent: ({ error }) => {
    return <ErrorComponent error={error} />;
  },
});

function AppLayout() {
  // Read shared data from root loader (avoids duplicate API calls)
  const rootMatch = useMatch({ from: rootRouteId, shouldThrow: false });
  const rootData = rootMatch?.loaderData as RootLoaderData | undefined;
  const socialNetworks = rootData?.socialNetworks ?? null;
  const profiles = rootData?.profiles ?? [];

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
