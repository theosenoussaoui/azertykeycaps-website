import type { AppRouter } from "@azertykeycaps-app/api/routers/index";

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { t } from "@/i18n";
import { serverEnv } from "@/lib/server-env";

// Create a server-side tRPC client
function createServerTRPCClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${serverEnv.SERVER_URL}/trpc`,
      }),
    ],
  });
}

// Server function to fetch suggestion page content
const getSuggestPageContent = createServerFn({ method: "GET" }).handler(async () => {
  const client = createServerTRPCClient();
  return await client.globals.suggestionPage.query();
});

export const Route = createFileRoute("/_app/suggest")({
  component: SuggestPage,
  loader: async () => {
    const content = await getSuggestPageContent();
    return { content };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  }),
  head: () => {
    const i18n = t();
    return {
      meta: [
        {
          title: i18n.pages.suggest.metaTitle,
        },
        {
          name: "description",
          content: i18n.pages.suggest.metaDescription,
        },
      ],
    };
  },
});

function SuggestPage() {
  const { content } = Route.useLoaderData();
  const i18n = t();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold">{content?.title ?? i18n.pages.suggest.title}</h1>
          <p className="text-muted-foreground text-lg">
            {content?.description ?? i18n.pages.suggest.description}
          </p>
        </header>

        <div className="rounded-lg border bg-muted/50 p-6">
          <p className="text-muted-foreground text-center">{i18n.pages.suggest.comingSoon}</p>
        </div>
      </div>
    </div>
  );
}
