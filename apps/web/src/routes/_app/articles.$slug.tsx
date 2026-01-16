import type { AppRouter } from "@azertykeycaps-app/api/routers/index";
import type { Article } from "@azertykeycaps-app/schemas";

import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { ArrowLeftIcon, ExternalLinkIcon, AlertTriangleIcon, AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { PageContainer, PageSection, PageSectionContent } from "@/components/ui/page-container";
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
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    return {
      meta: [
        {
          title: article ? `${article.title} - Azertykeycaps` : "Article - Azertykeycaps",
        },
        {
          name: "description",
          content: article?.description ?? "Decouvrez ce keyset sur Azertykeycaps.",
        },
      ],
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 5 * 60_000, // Client considers data fresh for 5 minutes
  gcTime: 30 * 60_000, // Keep in memory for 30 minutes
  errorComponent: () => {
    const router = useRouter();
    const i18n = t();
    return (
      <PageContainer size="md">
        <nav className="py-4">
          <Button variant="ghost" size="sm" render={<Link to="/" />}>
            <ArrowLeftIcon />
            {i18n.common.back}
          </Button>
        </nav>
        <PageSection>
          <PageSectionContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertCircleIcon />
                </EmptyMedia>
                <EmptyTitle>{i18n.errors.generic}</EmptyTitle>
                <EmptyDescription>{i18n.errors.loadingFailed}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => router.invalidate()}>
                  {i18n.common.retry}
                </Button>
              </EmptyContent>
            </Empty>
          </PageSectionContent>
        </PageSection>
      </PageContainer>
    );
  },
});

function ArticleDetailPage() {
  const { article } = Route.useLoaderData();
  const i18n = t();

  return (
    <PageContainer size="md">
      {/* Back Navigation */}
      <nav className="py-4">
        <Button variant="ghost" size="sm" render={<Link to="/" />}>
          <ArrowLeftIcon />
          {i18n.common.back}
        </Button>
      </nav>

      <ArticleContent article={article} i18n={i18n} />
    </PageContainer>
  );
}

function ArticleContent({ article, i18n }: { article: Article; i18n: ReturnType<typeof t> }) {
  return (
    <article>
      {/* Hero Image */}
      <figure className="mb-8">
        <img
          src={article.img.url ?? ""}
          alt={article.img.alt}
          className="aspect-video w-full object-cover"
          loading="eager"
        />
      </figure>

      {/* Article Header */}
      <header className="mb-8 space-y-4">
        {/* Badges */}
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

        {/* Title */}
        <h1 className="font-heading text-3xl @sm:text-4xl">{article.title}</h1>

        {/* Description */}
        {article.description && (
          <p className="text-lg text-muted-foreground">{article.description}</p>
        )}
      </header>

      {/* Warning */}
      {article.warningText && (
        <PageSection spacing="sm">
          <PageSectionContent>
            <Alert variant="warning">
              <AlertTriangleIcon className="size-4" />
              <AlertDescription>{article.warningText}</AlertDescription>
            </Alert>
          </PageSectionContent>
        </PageSection>
      )}

      {/* Action Buttons */}
      <PageSection spacing="sm">
        <PageSectionContent>
          <div className="flex flex-wrap gap-3">
            <Button render={<a href={article.url} target="_blank" rel="noopener noreferrer" />}>
              {i18n.articles.viewArticle}
              <ExternalLinkIcon />
            </Button>
            {article.affiliateUrl && (
              <Button
                variant="secondary"
                render={<a href={article.affiliateUrl} target="_blank" rel="noopener noreferrer" />}
              >
                {i18n.articles.affiliateLink}
                <ExternalLinkIcon />
              </Button>
            )}
            {article.additionalUrl && (
              <Button
                variant="outline"
                render={
                  <a href={article.additionalUrl} target="_blank" rel="noopener noreferrer" />
                }
              >
                {i18n.articles.additionalLink}
                <ExternalLinkIcon />
              </Button>
            )}
          </div>
        </PageSectionContent>
      </PageSection>

      {/* Dates */}
      {(article.startDate || article.endDate) && (
        <PageSection spacing="sm">
          <PageSectionContent>
            <dl className="grid gap-2 text-sm @xs:grid-cols-2">
              {article.startDate && (
                <div>
                  <dt className="text-muted-foreground">{i18n.articles.startDate}</dt>
                  <dd>
                    <time dateTime={article.startDate}>{formatDate(article.startDate)}</time>
                  </dd>
                </div>
              )}
              {article.endDate && (
                <div>
                  <dt className="text-muted-foreground">{i18n.articles.endDate}</dt>
                  <dd>
                    <time dateTime={article.endDate}>{formatDate(article.endDate)}</time>
                  </dd>
                </div>
              )}
            </dl>
          </PageSectionContent>
        </PageSection>
      )}
    </article>
  );
}
