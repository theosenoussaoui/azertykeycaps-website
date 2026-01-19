import {
  profilePageFiltersSchema,
  type ArticleMaterial,
  type ArticleStatus,
} from "@azertykeycaps-app/schemas";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, SearchXIcon } from "lucide-react";

import { PageErrorWithBack } from "@/components/errors/page-error";
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
import { getArticlesByProfile } from "@/features/articles/api/get-articles-by-profile";
import { ArticleCard } from "@/features/articles/components/article-card";
import { ArticleFilters } from "@/features/articles/components/article-filters";
import { ArticlesPagination } from "@/features/articles/components/articles-pagination";
import { t } from "@/i18n";

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
    const data = await getArticlesByProfile({
      data: { slug: params.slug, ...deps },
    });
    return data;
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  head: ({ loaderData }) => {
    const profileTitle =
      loaderData?.articles.docs[0]?.profile?.title ?? loaderData?.profileSlug;
    const articleCount = loaderData?.articles.totalDocs ?? 0;
    return {
      meta: [
        { title: `${profileTitle} - Azertykeycaps` },
        {
          name: "description",
          content: `Decouvrez ${articleCount} keyset${articleCount > 1 ? "s" : ""} avec le profil ${profileTitle} sur Azertykeycaps.`,
        },
      ],
    };
  },
  errorComponent: PageErrorWithBack,
});

function ProfilePage() {
  const navigate = useNavigate();
  const params = Route.useParams();
  const search = Route.useSearch();
  const { articles, profileSlug } = Route.useLoaderData();
  const i18n = t();

  const profileInfo = articles.docs[0]?.profile;
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
        <PageTitle>{profileInfo?.title ?? profileSlug}</PageTitle>
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
            <CardGrid as="ul">
              {articles.docs.map((article) => (
                <GridCard
                  key={article.id}
                  as="li"
                  className="col-span-2 md:col-span-2"
                >
                  <ArticleCard
                    article={article}
                    preload="viewport"
                    variant="grid"
                  />
                </GridCard>
              ))}
            </CardGrid>
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
