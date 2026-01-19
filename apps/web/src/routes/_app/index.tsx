import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { AlertCircleIcon, InboxIcon } from "lucide-react";

import { PageError } from "@/components/errors/page-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardGrid, GridCard } from "@/components/ui/card-grid";
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
import { SectionDivider } from "@/components/ui/section-divider";
import { getLatestArticles } from "@/features/articles/api/get-latest-articles";
import { ArticleCard } from "@/features/articles/components/article-card";
import { t } from "@/i18n";
import { getPreloadImageUrl } from "@/lib/image-utils";
import {
  generateCanonical,
  generateItemListSchema,
  generateJsonLd,
  generateMeta,
} from "@/lib/seo";

const appRouteApi = getRouteApi("/_app");

export const Route = createFileRoute("/_app/")({
  component: HomeComponent,
  loader: async () => getLatestArticles(),
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: ({ loaderData }) => {
    const i18n = t();
    const articles = loaderData?.articles?.docs ?? [];
    const firstArticle = articles[0];
    // Use optimized image URL for preloading (matches what OptimizedImage renders)
    const preloadImageUrl = getPreloadImageUrl(firstArticle?.img.url, "card");

    return {
      meta: generateMeta({
        title: i18n.home.metaTitle,
        description: i18n.home.metaDescription,
        path: "/",
        image: firstArticle?.img.url,
      }),
      links: [
        generateCanonical("/"),
        ...(preloadImageUrl
          ? [
              {
                rel: "preload",
                as: "image",
                href: preloadImageUrl,
              },
            ]
          : []),
      ],
      scripts: [
        generateJsonLd(
          generateItemListSchema(
            articles.map((a) => ({ slug: a.slug, title: a.title })),
          ),
        ),
      ].filter(Boolean),
    };
  },
  errorComponent: PageError,
});

function HomeComponent() {
  const { articles } = Route.useLoaderData();
  const { profiles } = appRouteApi.useLoaderData();
  const i18n = t();

  return (
    <PageContainer>
      {/* Hero Section - left aligned, bigger title */}
      <PageHeader>
        <PageTitle className="text-4xl @sm:text-5xl @md:text-6xl @lg:text-7xl">
          {i18n.home.title}
        </PageTitle>
        <PageDescription>{i18n.home.subtitle}</PageDescription>
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
                <EmptyDescription>
                  {i18n.pages.profile.noArticlesDescription}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <SectionDivider />
              <CardGrid as="ul">
                {articles.docs.map((article) => (
                  <GridCard
                    key={article.id}
                    as="li"
                    className="col-span-2 md:col-span-2"
                  >
                    <ArticleCard article={article} variant="grid" />
                  </GridCard>
                ))}
              </CardGrid>
              <SectionDivider />
            </>
          )}
        </PageSectionContent>
      </PageSection>

      {/* Browse by Profile Section */}
      <PageSection>
        <PageSectionHeader>
          <PageSectionTitle>{i18n.home.browseByProfile}</PageSectionTitle>
        </PageSectionHeader>
        <PageSectionContent>
          <SectionDivider />
          <CardGrid as="ul">
            {profiles.map((profile) => (
              <GridCard
                key={profile.slug}
                as="li"
                className="col-span-1 md:col-span-2"
              >
                <Link
                  to="/profile/$slug"
                  params={{ slug: profile.slug }}
                  preload="viewport"
                  className="block h-full"
                >
                  <Card className="h-full border-0 shadow-none transition-colors hover:bg-accent">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{profile.title}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {profile.abbreviation}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        {profile.navbarDescription}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </GridCard>
            ))}
          </CardGrid>
          <SectionDivider />
        </PageSectionContent>
      </PageSection>
    </PageContainer>
  );
}
