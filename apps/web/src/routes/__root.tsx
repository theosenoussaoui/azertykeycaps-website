import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import appCss from "@/index.css?url";

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
        content: "#f8fafc",
      },
      {
        title: "Azertykeycaps - Annuaire de keycaps françaises",
      },
    ],
    links: [
      // App styles (includes self-hosted Space Mono font via Fontsource)
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
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
