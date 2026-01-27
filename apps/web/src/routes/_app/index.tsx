import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
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
import { getLatestArticles } from "@/features/articles/api/get-latest-articles";
import { ArticleCard } from "@/features/articles/components/article-card";
import { getHomepageContent } from "@/features/globals/api/get-homepage-content";
import { t } from "@/i18n";
import { buildCacheHeaders } from "@/lib/cache-tags";
import { getPreloadLinkAttributes } from "@/lib/image-utils";
import {
  generateCanonical,
  generateItemListSchema,
  generateJsonLd,
  generateMeta,
} from "@/lib/seo";

const appRouteApi = getRouteApi("/_app");

export const Route = createFileRoute("/_app/")({
  component: HomeComponent,
  loader: async () => {
    const [articlesData, homepage, i18n] = await Promise.all([
      getLatestArticles(),
      getHomepageContent(),
      t(),
    ]);
    return { ...articlesData, homepage, i18n };
  },
  headers: () => buildCacheHeaders({ global: ["homepage"] }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: ({ loaderData }) => {
    const i18n = loaderData?.i18n ?? t();
    const articles = loaderData?.articles?.docs ?? [];
    const homepage = loaderData?.homepage;
    const firstArticle = articles[0];
    // Use enhanced preload with responsive hints for optimal LCP
    const preloadLink = getPreloadLinkAttributes(firstArticle?.img.url, "card");

    // Use CMS content with i18n fallbacks
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
  const { articles, homepage, i18n } = Route.useLoaderData();
  const { profiles } = appRouteApi.useLoaderData();

  // Use CMS content with i18n fallbacks
  const title = homepage?.title ?? i18n.home.title;
  const subtitle = homepage?.subtitle ?? i18n.home.subtitle;

  return (
    <PageContainer>
      {/* Hero Section - left aligned, bigger title */}
      <PageHeader>
        <PageTitle className="text-4xl @sm:text-5xl @md:text-6xl @lg:text-7xl">
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
