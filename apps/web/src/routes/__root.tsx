import type {
  KeycapProfileRef,
  NotFoundPage,
  SocialNetworks,
} from "@azertykeycaps-app/schemas";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { NotFound } from "@/components/errors/not-found";
import { getLayoutData } from "@/features/pages/api/get-layout-data";
import appCss from "@/index.css?url";
import { siteConfig } from "@/lib/seo";

export interface RootLoaderData {
  profiles: KeycapProfileRef[];
  socialNetworks: SocialNetworks | null;
  notFoundContent: NotFoundPage | null;
}

// Lazy load Toaster - toasts are rare, no need to block initial render
const Toaster = lazy(() =>
  import("@/components/ui/sonner").then((m) => ({
    default: m.Toaster,
  })),
);

// Lazy load devtools only in development - removes ~100KB from production bundle
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : () => null;

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  : () => null;

export interface RouterAppContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  loader: async (): Promise<RootLoaderData> => {
    const data = await getLayoutData();
    return {
      profiles: data.profiles,
      socialNetworks: data.socialNetworks,
      notFoundContent: data.notFoundPage,
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "theme-color",
        content: siteConfig.themeColor,
      },
      {
        title: `${siteConfig.name} - ${siteConfig.description}`,
      },
      // Default Open Graph for pages that don't override
      { property: "og:site_name", content: siteConfig.name },
      { property: "og:locale", content: siteConfig.locale },
      { property: "og:type", content: "website" },
    ],
    links: [
      // App styles (includes self-hosted Geist font via Fontsource)
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    // Note: JSON-LD is added per-page for better specificity
    // WebSite schema is not critical - page-specific schemas are more important
  }),

  component: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument() {
  return (
    <html lang="fr" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="relative">
        <div className="relative isolate flex min-h-svh flex-col">
          <Outlet />
          <Suspense fallback={null}>
            <Toaster richColors />
            <TanStackRouterDevtools position="bottom-left" />
            <ReactQueryDevtools
              position="bottom"
              buttonPosition="bottom-right"
            />
          </Suspense>
          <Scripts />
        </div>
      </body>
    </html>
  );
}
