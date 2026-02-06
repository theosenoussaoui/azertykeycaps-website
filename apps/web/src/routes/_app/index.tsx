import type { LayoutData } from "@/routes/_app";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircleIcon, InboxIcon, ArrowRightIcon } from "lucide-react";

import { PageError } from "@/components/errors/page-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardGrid, GridCard } from "@/components/ui/card-grid";
import {
  Empty,
  EmptyContent,
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
import { ArticleCard } from "@/features/articles/components/article-card";
import { getHomeWithLayoutData } from "@/features/pages/api/get-home-with-layout-data";
import { t } from "@/i18n";
import { buildCacheHeaders } from "@/lib/cache-tags";
import { getPreloadLinkAttributes } from "@/lib/image-utils";
import {
  generateCanonical,
  generateItemListSchema,
  generateJsonLd,
  generateMeta,
} from "@/lib/seo";

export const Route = createFileRoute("/_app/")({
  component: HomeComponent,
  loader: async () => {
    const loaderStart = performance.now();

    const [pageData, i18n] = await Promise.all([
      (async () => {
        const start = performance.now();
        const data = await getHomeWithLayoutData();
        console.log(
          `[route:/_app/] getHomeWithLayoutData: ${(performance.now() - start).toFixed(1)}ms`,
        );
        return data;
      })(),
      (async () => {
        const start = performance.now();
        const data = t();
        console.log(
          `[route:/_app/] t(): ${(performance.now() - start).toFixed(1)}ms`,
        );
        return data;
      })(),
    ]);

    console.log(
      `[route:/_app/] loader total: ${(performance.now() - loaderStart).toFixed(1)}ms`,
    );

    const layoutData: LayoutData = {
      profiles: pageData.profiles,
      socialNetworks: pageData.socialNetworks,
    };

    return {
      articles: pageData.articles,
      homepage: pageData.homepage,
      layoutData,
      i18n,
    };
  },
  headers: () => buildCacheHeaders({ global: ["homepage"] }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: ({ loaderData }) => {
    const i18n = loaderData?.i18n ?? t();
    const articles = loaderData?.articles?.docs ?? [];
    const homepage = loaderData?.homepage;
    const firstArticle = articles[0];
    const preloadLink = getPreloadLinkAttributes(firstArticle?.img.url, "card");

    const title = homepage?.title ?? i18n.home.title;
    const subtitle = homepage?.subtitle ?? i18n.home.subtitle;

    return {
      meta: generateMeta({
        title,
        description: subtitle,
        path: "/",
        image: firstArticle?.img.url,
        seo: homepage,
      }),
      links: [generateCanonical("/"), ...(preloadLink ? [preloadLink] : [])],
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
  const { articles, homepage, layoutData, i18n } = Route.useLoaderData();
  const profiles = layoutData.profiles;

  const title = homepage?.title ?? i18n.home.title;
  const subtitle = homepage?.subtitle ?? i18n.home.subtitle;

  return (
    <PageContainer>
      {/* Hero Section - left aligned, bigger title */}
      <PageHeader>
        <PageTitle className="mb-6 text-5xl leading-16 @sm:text-4xl @md:text-5xl @lg:text-6xl">
          {title}
        </PageTitle>
        <PageDescription>{subtitle}</PageDescription>
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
              <EmptyContent>
                <Button
                  variant="secondary"
                  render={<a href="#browse-profiles" />}
                >
                  {i18n.home.browseByProfile}
                  <ArrowRightIcon />
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <>
              <SectionDivider />
              <CardGrid as="ul">
                {articles.docs.map((article, index) => (
                  <GridCard
                    key={article.id}
                    as="li"
                    className="col-span-2 md:col-span-2"
                  >
                    <ArticleCard
                      article={article}
                      variant="grid"
                      priority={index === 0}
                    />
                  </GridCard>
                ))}
              </CardGrid>
              <SectionDivider />
            </>
          )}
        </PageSectionContent>
      </PageSection>

      {/* Browse by Profile Section */}
      <PageSection id="browse-profiles">
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
                  preload="intent"
                  className="block h-full"
                >
                  <Card className="h-full border-0 bg-transparent shadow-none">
                    <CardHeader className="gap-3">
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
