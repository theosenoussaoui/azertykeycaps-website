import type { AppRouter } from "@azertykeycaps-app/api/routers/index";

import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
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

// Server function to fetch articles by profile slug
const getArticlesByProfile = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const client = createServerTRPCClient();

    // Fetch articles filtered by profile
    const articlesResponse = await client.articles.list.query({
      profile: data.slug,
      limit: 100, // Get all articles for this profile
      page: 1,
    });

    return {
      articles: articlesResponse,
      profileSlug: data.slug,
    };
  });

export const Route = createFileRoute("/_app/profile/$slug")({
  component: ProfilePage,
  loader: async ({ params }) => {
    const data = await getArticlesByProfile({ data: { slug: params.slug } });
    return data;
  },
  headers: () => ({
    "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
    "CDN-Cache-Control": "max-age=7200",
  }),
  staleTime: 5 * 60_000, // Client considers data fresh for 5 minutes
  gcTime: 30 * 60_000, // Keep in memory for 30 minutes
  head: ({ loaderData }) => {
    const profileTitle = loaderData?.articles.docs[0]?.profile?.title ?? loaderData?.profileSlug;
    const articleCount = loaderData?.articles.totalDocs ?? 0;
    return {
      meta: [
        {
          title: `${profileTitle} - Azertykeycaps`,
        },
        {
          name: "description",
          content: `Découvrez ${articleCount} keyset${articleCount > 1 ? "s" : ""} avec le profil ${profileTitle} sur Azertykeycaps.`,
        },
      ],
    };
  },
});

function ProfilePage() {
  const { articles, profileSlug } = Route.useLoaderData();
  const i18n = t();

  // Get profile info from the first article if available
  const profileInfo = articles.docs[0]?.profile;

  if (articles.docs.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">{i18n.pages.profile.noArticles}</span>
          </h1>
          <p className="text-muted-foreground mt-4">{i18n.pages.profile.noArticlesDescription}</p>
          <Link to="/" search={{ page: 1 }} className="mt-8 inline-block">
            <Button variant="secondary">{i18n.common.backHome}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link to="/" search={{ page: 1 }}>
          <Button variant="ghost" size="sm">
            &larr; {i18n.common.back}
          </Button>
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold">{profileInfo?.title ?? profileSlug}</h1>
        {articles.totalDocs > 0 && (
          <p className="text-muted-foreground mt-2">
            {articles.totalDocs} article{articles.totalDocs > 1 ? "s" : ""}
          </p>
        )}
      </header>

      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.docs.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}
