import type { AppRouter } from "@azertykeycaps-app/api/routers/index";
import type { Article } from "@azertykeycaps-app/schemas";

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";
import { STATUS_VARIANTS } from "@/lib/article-utils";
import { formatDate } from "@/lib/date-utils";
import { serverEnv } from "@/lib/server-env";

// Create a server-side tRPC client that calls the API server
function createServerTRPCClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${serverEnv.SERVER_URL}/trpc`,
      }),
    ],
  });
}

// Server function to fetch article by slug via API server
const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const client = createServerTRPCClient();
    return await client.articles.bySlug.query({ slug: data.slug });
  });

export const Route = createFileRoute("/_app/articles/$slug")({
  component: ArticleDetailPage,
  loader: async ({ params }) => {
    const article = await getArticleBySlug({ data: { slug: params.slug } });

    if (!article) {
      throw notFound();
    }

    return { article };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    "CDN-Cache-Control": "max-age=7200",
  }),
  staleTime: 5 * 60_000, // Client considers data fresh for 5 minutes
  gcTime: 30 * 60_000, // Keep in memory for 30 minutes
});

function ArticleDetailPage() {
  const { article } = Route.useLoaderData();
  const i18n = t();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link to="/" search={{ page: 1 }}>
          <Button variant="ghost" size="sm">
            &larr; {i18n.common.back}
          </Button>
        </Link>
      </div>

      <ArticleContent article={article} i18n={i18n} />
    </div>
  );
}

function ArticleContent({ article, i18n }: { article: Article; i18n: ReturnType<typeof t> }) {
  return (
    <article className="space-y-6">
      <img
        src={article.img.url}
        alt={article.img.alt}
        className="aspect-video w-full rounded-lg object-cover"
      />

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANTS[article.status]}>{i18n.status[article.status]}</Badge>
          {article.isNew && <Badge variant="default">{i18n.common.new}</Badge>}
          {article.profile && (
            <Link to="/profile/$slug" params={{ slug: article.profile.slug }}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                {article.profile.title}
              </Badge>
            </Link>
          )}
          {article.material && <Badge variant="outline">{i18n.materials[article.material]}</Badge>}
        </div>

        <h1 className="text-3xl font-bold">{article.title}</h1>

        {article.description && <p className="text-muted-foreground">{article.description}</p>}
      </header>

      {article.warningText && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{article.warningText}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <Button>{i18n.articles.viewArticle}</Button>
        </a>
        {article.affiliateUrl && (
          <a href={article.affiliateUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">{i18n.articles.affiliateLink}</Button>
          </a>
        )}
        {article.additionalUrl && (
          <a href={article.additionalUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">{i18n.articles.additionalLink}</Button>
          </a>
        )}
      </div>

      {(article.startDate || article.endDate) && (
        <div className="text-muted-foreground text-sm">
          {article.startDate && (
            <p>
              {i18n.articles.startDate}: {formatDate(article.startDate)}
            </p>
          )}
          {article.endDate && (
            <p>
              {i18n.articles.endDate}: {formatDate(article.endDate)}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
