import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { AlertCircleIcon, InboxIcon } from "lucide-react";

import { PageError } from "@/components/errors/page-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  PageContainer,
  PageDescription,
  PageHeader,
  PageSection,
  PageSectionContent,
  PageSectionHeader,
  PageSectionTitle,
  PageTitle,
} from "@/components/ui/page-container";
import { getLatestArticles } from "@/features/articles/api/get-latest-articles";
import { ArticleCard } from "@/features/articles/components/article-card";
import { t } from "@/i18n";
import { getPreloadImageUrl } from "@/lib/image-utils";

const appRouteApi = getRouteApi("/_app");

export const Route = createFileRoute("/_app/")({
  component: HomeComponent,
  loader: async () => getLatestArticles(),
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: ({ loaderData }) => {
    const i18n = t();
    const firstArticle = loaderData?.articles?.docs?.[0];
    // Use optimized image URL for preloading (matches what OptimizedImage renders)
    const preloadImageUrl = getPreloadImageUrl(firstArticle?.img.url, "card");

    return {
      meta: [
        { title: i18n.home.metaTitle },
        { name: "description", content: i18n.home.metaDescription },
      ],
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
  errorComponent: PageError,
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
                <EmptyDescription>{i18n.pages.profile.noArticlesDescription}</EmptyDescription>
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
