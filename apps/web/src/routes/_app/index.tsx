import type { AppRouter } from "@azertykeycaps-app/api/routers/index";

import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { ArticleCard } from "@/components/article-card";
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

// Server function to fetch latest articles for landing page
const getLatestArticles = createServerFn({ method: "GET" }).handler(async () => {
  const client = createServerTRPCClient();

  const articles = await client.articles.list.query({
    page: 1,
    limit: 3,
  });

  return { articles };
});

// Get parent route API to access profiles from layout
const appRouteApi = getRouteApi("/_app");

export const Route = createFileRoute("/_app/")({
  component: HomeComponent,
  loader: async () => {
    const data = await getLatestArticles();
    return data;
  },
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: () => {
    const i18n = t();
    return {
      meta: [
        { title: i18n.home.metaTitle },
        { name: "description", content: i18n.home.metaDescription },
      ],
    };
  },
});

function HomeComponent() {
  const { articles } = Route.useLoaderData();
  const { profiles } = appRouteApi.useLoaderData();
  const i18n = t();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Hero Section */}
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">{i18n.home.title}</h1>
        <p className="text-lg text-muted-foreground">{i18n.home.subtitle}</p>
      </header>

      {/* Latest Articles Section */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">{i18n.home.latestArticles}</h2>
        {articles.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
            <p className="text-red-600 dark:text-red-400">
              {i18n.common.error}: {articles.error}
            </p>
          </div>
        ) : articles.docs.length === 0 ? (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">{i18n.common.noResults}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.docs.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* Browse by Profile Section */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold">{i18n.home.browseByProfile}</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {profiles.map((profile) => (
            <Link
              key={profile.slug}
              to="/profile/$slug"
              params={{ slug: profile.slug }}
              search={{ page: 1 }}
              className="group rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{profile.title}</span>
                <span className="text-sm text-muted-foreground">{profile.abbreviation}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
