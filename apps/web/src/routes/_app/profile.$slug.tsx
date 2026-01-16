import type { AppRouter } from "@azertykeycaps-app/api/routers/index";
import {
  profilePageFiltersSchema,
  type ProfilePageFilters,
  type ArticleMaterial,
  type ArticleStatus,
} from "@azertykeycaps-app/schemas";

import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { ArrowLeftIcon, SearchXIcon, AlertCircleIcon } from "lucide-react";

import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { ArticlesPagination } from "@/components/articles-pagination";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageSection,
  PageSectionContent,
} from "@/components/ui/page-container";
import { t } from "@/i18n";
import { serverEnv } from "@/lib/server-env";

function createServerTRPCClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${serverEnv.SERVER_URL}/trpc`,
      }),
    ],
  });
}

type ProfilePageInput = { slug: string } & ProfilePageFilters;

const getArticlesByProfile = createServerFn({ method: "GET" })
  .inputValidator((data: ProfilePageInput) => data)
  .handler(async ({ data }) => {
    const client = createServerTRPCClient();

    const articlesResponse = await client.articles.list.query({
      profile: data.slug,
      page: data.page ?? 1,
      limit: 12,
      status: data.status,
      material: data.material,
      isNew: data.isNew,
      search: data.search,
    });

    return {
      articles: articlesResponse,
      profileSlug: data.slug,
    };
  });

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
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
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
          content: `Decouvrez ${articleCount} keyset${articleCount > 1 ? "s" : ""} avec le profil ${profileTitle} sur Azertykeycaps.`,
        },
      ],
    };
  },
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
      <PageContainer size="md">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>{i18n.pages.profile.noArticles}</EmptyTitle>
            <EmptyDescription>{i18n.pages.profile.noArticlesDescription}</EmptyDescription>
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
    <PageContainer size="lg">
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
                  Essayez de modifier vos filtres pour trouver des articles.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={handleClearFilters}>
                  {i18n.common.clearFilters}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ul className="grid gap-6 @sm:grid-cols-2 @lg:grid-cols-3" role="list">
              {articles.docs.map((article) => (
                <li key={article.id}>
                  <ArticleCard article={article} preload="viewport" />
                </li>
              ))}
            </ul>
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
