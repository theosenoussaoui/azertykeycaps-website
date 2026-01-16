import type { AppRouter } from "@azertykeycaps-app/api/routers/index";

import { createFileRoute, Link, getRouteApi, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { AlertCircleIcon, InboxIcon } from "lucide-react";

import { ArticleCard } from "@/components/article-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageSection,
  PageSectionHeader,
  PageSectionTitle,
  PageSectionContent,
} from "@/components/ui/page-container";
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
  head: ({ loaderData }) => {
    const i18n = t();
    // Get the first article's image for LCP preloading
    const firstArticle = loaderData?.articles?.docs?.[0];
    const preloadImageUrl = firstArticle?.img.sizes?.card?.url ?? firstArticle?.img.url;

    return {
      meta: [
        { title: i18n.home.metaTitle },
        { name: "description", content: i18n.home.metaDescription },
      ],
      // Preload first article image for faster LCP on homepage
      links: preloadImageUrl
        ? [
            {
              rel: "preload",
              as: "image",
              href: preloadImageUrl,
            },
          ]
        : [],
    };
  },
  errorComponent: () => {
    const router = useRouter();
    const i18n = t();
    return (
      <PageContainer size="md">
        <PageSection>
          <PageSectionContent>
            <Alert variant="error">
              <AlertCircleIcon className="size-4" />
              <AlertDescription>{i18n.errors.loadingFailed}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => router.invalidate()}>
                {i18n.common.retry}
              </Button>
            </div>
          </PageSectionContent>
        </PageSection>
      </PageContainer>
    );
  },
});

function HomeComponent() {
  const { articles } = Route.useLoaderData();
  const { profiles } = appRouteApi.useLoaderData();
  const i18n = t();

  return (
    <PageContainer size="lg">
      {/* Hero Section */}
      <PageHeader className="text-center">
        <PageTitle>{i18n.home.title}</PageTitle>
        <PageDescription className="mx-auto">{i18n.home.subtitle}</PageDescription>
      </PageHeader>

      {/* Latest Articles Section */}
      <PageSection>
        <PageSectionHeader>
          <PageSectionTitle>{i18n.home.latestArticles}</PageSectionTitle>
        </PageSectionHeader>
        <PageSectionContent>
          {articles.error ? (
            <Alert variant="error">
              <AlertCircleIcon className="size-4" />
              <AlertDescription>
                {i18n.common.error}: {articles.error}
              </AlertDescription>
            </Alert>
          ) : articles.docs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>{i18n.common.noResults}</EmptyTitle>
                <EmptyDescription>Aucun article disponible pour le moment.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="article-grid grid gap-6 @sm:grid-cols-2 @lg:grid-cols-3" role="list">
              {articles.docs.map((article) => (
                <li key={article.id}>
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
          )}
        </PageSectionContent>
      </PageSection>

      {/* Browse by Profile Section */}
      <PageSection>
        <PageSectionHeader>
          <PageSectionTitle>{i18n.home.browseByProfile}</PageSectionTitle>
        </PageSectionHeader>
        <PageSectionContent>
          <ul className="grid gap-4 @xs:grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-4" role="list">
            {profiles.map((profile) => (
              <li key={profile.slug}>
                <Link
                  to="/profile/$slug"
                  params={{ slug: profile.slug }}
                  preload="viewport"
                  className="block"
                >
                  <Card className="h-full transition-colors hover:bg-accent">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{profile.title}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {profile.abbreviation}
                        </span>
                      </CardTitle>
                      <CardDescription>{profile.navbarDescription}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </PageSectionContent>
      </PageSection>
    </PageContainer>
  );
}
