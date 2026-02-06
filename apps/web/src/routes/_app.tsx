import type {
  KeycapProfileRef,
  SocialNetworks,
} from "@azertykeycaps-app/schemas";
import {
  createFileRoute,
  ErrorComponent,
  Outlet,
  useChildMatches,
} from "@tanstack/react-router";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { GridLines } from "@/components/ui/grid-lines";

export interface LayoutData {
  profiles: KeycapProfileRef[];
  socialNetworks: SocialNetworks | null;
}

export const Route = createFileRoute("/_app")({
  component: AppLayout,
  errorComponent: ({ error }) => {
    return <ErrorComponent error={error} />;
  },
});

function AppLayout() {
  const layoutData = useChildMatches({
    select: (matches) => {
      for (const match of matches) {
        if (match.loaderData && "layoutData" in match.loaderData) {
          return match.loaderData.layoutData as LayoutData;
        }
      }
      return null;
    },
  });

  return (
    <div className="relative flex min-h-svh flex-col">
      <GridLines />
      <Header profiles={layoutData?.profiles ?? []} />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer socialNetworks={layoutData?.socialNetworks ?? null} />
    </div>
  );
}
