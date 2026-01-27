import {
  profilePageFiltersSchema,
  type ArticleMaterial,
  type ArticleStatus,
} from "@azertykeycaps-app/schemas";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, SearchXIcon } from "lucide-react";

import { PageErrorWithBack } from "@/components/errors/page-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  PageTitle,
} from "@/components/ui/page-container";
import { SectionDivider } from "@/components/ui/section-divider";
import { getArticlesByProfile } from "@/features/articles/api/get-articles-by-profile";
import { ArticleCard } from "@/features/articles/components/article-card";
import { ArticleFilters } from "@/features/articles/components/article-filters";
import { ArticlesPagination } from "@/features/articles/components/articles-pagination";
import { t } from "@/i18n";
import { buildCacheHeaders } from "@/lib/cache-tags";
import {
  generateCanonical,
  generateCollectionPageSchema,
  generateJsonLd,
  generateMeta,
} from "@/lib/seo";

export const Route = createFileRoute("/_app/profile/$slug")({
  component: ProfilePage,
  validateSearch: profilePageFiltersSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    status: search.status,
    material: search.material,
    isNew: search.isNew,
    search: search.search,
  }),
  loader: async ({ params, deps }) => {
    const [data, i18n] = await Promise.all([
      getArticlesByProfile({
        data: { slug: params.slug, ...deps },
      }),
      t(),
    ]);
    return { ...data, i18n };
  },
  headers: ({ loaderData }) =>
    buildCacheHeaders({
      profileSlug: loaderData?.profile?.slug ?? loaderData?.profileSlug,
    }),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  head: ({ loaderData, params }) => {
    const i18n = loaderData?.i18n ?? t();
    const articles = loaderData?.articles.docs ?? [];
    const profile = loaderData?.profile;
    const profileTitle =
      profile?.title ??
      articles[0]?.profile?.title ??
      loaderData?.profileSlug ??
      params.slug;
    const articleCount = loaderData?.articles.totalDocs ?? 0;
    const path = `/profile/${params.slug}`;

    // Use CMS description if available, otherwise generate dynamically
    const dynamicDescription = `${i18n.home.subtitle} ${articleCount} keyset${articleCount > 1 ? "s" : ""} ${profileTitle}.`;
    const description = profile?.description ?? dynamicDescription;

    return {
      meta: generateMeta({
        title: profileTitle,
        description,
        path,
        image: profile?.thumbnail?.url ?? articles[0]?.img.url,
        seo: profile,
      }),
      links: [generateCanonical(path)],
      scripts: [
        generateJsonLd(
          generateCollectionPageSchema({
            name: profile?.meta?.title ?? profileTitle,
            description: profile?.meta?.description ?? description,
            path,
            items: articles.map((a) => ({ slug: a.slug, title: a.title })),
          }),
        ),
      ].filter(Boolean),
    };
  },
  errorComponent: PageErrorWithBack,
});

function ProfilePage() {
  const navigate = useNavigate();
  const params = Route.useParams();
  const search = Route.useSearch();
  const { articles, profileSlug, profile, i18n } = Route.useLoaderData();

  // Use full profile data if available, otherwise fall back to article's profile ref
  const profileInfo = profile ?? articles.docs[0]?.profile;
  const hasActiveFilters = !!(search.status || search.material);

  const handleFilterChange = (
    key: "status" | "material",
    value: ArticleStatus | ArticleMaterial | undefined,
  ) => {
    navigate({
      to: "/profile/$slug",
      params: { slug: params.slug },
      search: {
        ...search,
        [key]: value,
        page: 1,
      },
    });
  };

  const handleClearFilters = () => {
    navigate({
      to: "/profile/$slug",
      params: { slug: params.slug },
      search: {},
    });
  };

  const handlePageChange = (page: number) => {
    navigate({
      to: "/profile/$slug",
      params: { slug: params.slug },
      search: {
        ...search,
        page,
      },
    });
  };

  // Empty state when no articles exist for this profile (not filtered)
  if (articles.docs.length === 0 && !hasActiveFilters) {
    return (
      <PageContainer>
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>{i18n.pages.profile.noArticles}</EmptyTitle>
            <EmptyDescription>
              {i18n.pages.profile.noArticlesDescription}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary" render={<Link to="/" />}>
              <ArrowLeftIcon />
              {i18n.common.backHome}
            </Button>
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Back Navigation */}
      <nav className="py-4">
        <Button variant="ghost" size="sm" render={<Link to="/" />}>
          <ArrowLeftIcon />
          {i18n.common.back}
        </Button>
      </nav>

      {/* Page Header */}
      <PageHeader className="py-4">
        <div className="flex flex-wrap items-center gap-3">
          <PageTitle>{profileInfo?.title ?? profileSlug}</PageTitle>
          {profileInfo?.shape && (
            <Badge variant="outline" className="text-xs">
              {i18n.pages.profile.shapes[profileInfo.shape]}
            </Badge>
          )}
        </div>
        {articles.totalDocs > 0 && (
          <PageDescription>
            {articles.totalDocs} article{articles.totalDocs > 1 ? "s" : ""}
          </PageDescription>
        )}
      </PageHeader>

      {/* Filters */}
      <PageSection spacing="sm">
        <PageSectionContent>
          <ArticleFilters
            showProfileFilter={false}
            selectedStatus={search.status}
            selectedMaterial={search.material}
            onStatusChange={(v) => handleFilterChange("status", v)}
            onMaterialChange={(v) => handleFilterChange("material", v)}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </PageSectionContent>
      </PageSection>

      {/* Articles Grid */}
      <PageSection>
        <PageSectionContent>
          {articles.docs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon />
                </EmptyMedia>
                <EmptyTitle>{i18n.common.noResults}</EmptyTitle>
                <EmptyDescription>
                  {i18n.pages.profile.noFilterResults}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={handleClearFilters}>
                  {i18n.common.clearFilters}
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
                    <ArticleCard
                      article={article}
                      preload="intent"
                      variant="grid"
                    />
                  </GridCard>
                ))}
              </CardGrid>
              <SectionDivider />
            </>
          )}
        </PageSectionContent>
      </PageSection>

      {/* Pagination */}
      {articles.totalPages > 1 && (
        <PageSection spacing="sm">
          <PageSectionContent>
            <ArticlesPagination
              currentPage={articles.page}
              totalPages={articles.totalPages}
              onPageChange={handlePageChange}
            />
          </PageSectionContent>
        </PageSection>
      )}
    </PageContainer>
  );
}
