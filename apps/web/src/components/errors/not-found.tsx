import type { AppLoaderData } from "@/routes/_app";
import { Link, useMatch } from "@tanstack/react-router";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { CurvedRoot, CurvedText } from "@/components/ui/curved-loop";
import { GridLines } from "@/components/ui/grid-lines";

export function NotFound() {
  const appMatch = useMatch({ from: "/_app", shouldThrow: false });
  const loaderData = appMatch?.loaderData as AppLoaderData | undefined;

  const profiles = loaderData?.profiles ?? [];
  const socialNetworks = loaderData?.socialNetworks ?? null;
  const notFoundContent = loaderData?.notFoundContent;

  const title = notFoundContent?.title ?? "404";
  const description =
    notFoundContent?.description ??
    "Page not found. The page you're looking for doesn't exist or has been moved.";
  const ctaText = notFoundContent?.ctaText ?? "Back to Home";

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
            <CurvedText>{title}</CurvedText>
          </CurvedRoot>
          <p className="mb-8 text-xl text-muted-foreground">{description}</p>
          <Button render={<Link to="/" className="font-semibold uppercase" />}>
            {ctaText}
          </Button>
        </div>
      </main>
      <Footer socialNetworks={socialNetworks} />
    </div>
  );
}
