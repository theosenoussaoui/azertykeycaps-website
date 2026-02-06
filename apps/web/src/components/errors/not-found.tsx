import type { LayoutData } from "@/routes/_app";
import { Link, useMatches } from "@tanstack/react-router";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { CurvedRoot, CurvedText } from "@/components/ui/curved-loop";
import { GridLines } from "@/components/ui/grid-lines";

export function NotFound() {
  const matches = useMatches();

  let profiles: LayoutData["profiles"] = [];
  let socialNetworks: LayoutData["socialNetworks"] = null;

  for (const match of matches) {
    const data = match.loaderData as Record<string, unknown> | undefined;
    if (data && "layoutData" in data && data.layoutData) {
      const ld = data.layoutData as LayoutData;
      profiles = ld.profiles;
      socialNetworks = ld.socialNetworks;
      break;
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col">
      <GridLines />
      <Header profiles={profiles} />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
        <div className="mx-auto w-full max-w-2xl text-center">
          <CurvedRoot
            className="h-16 sm:h-24"
            speed={1}
            curveAmount={0}
            interactive
          >
            <CurvedText>404</CurvedText>
          </CurvedRoot>
          <p className="mb-8 text-xl text-muted-foreground">
            Page not found. The page you're looking for doesn't exist or has
            been moved.
          </p>
          <Button render={<Link to="/" className="font-semibold uppercase" />}>
            Back to Home
          </Button>
        </div>
      </main>
      <Footer socialNetworks={socialNetworks} />
    </div>
  );
}
