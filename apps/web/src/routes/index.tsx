import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  articleFiltersSchema,
  type ArticleMaterial,
  type ArticleStatus,
} from "@azertykeycaps-app/schemas";

import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { ArticlesPagination } from "@/components/articles-pagination";
import { useTRPC } from "@/lib/trpc";
import { t } from "@/i18n";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  validateSearch: articleFiltersSchema,
});

function HomeComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const i18n = t();

  // Check if any filters are active
  const hasActiveFilters = !!(search.profile || search.status || search.material);

  // Fetch profiles for filter dropdown
  const profilesQuery = useQuery(trpc.articles.profiles.queryOptions({ limit: 100 }));

  // Fetch articles with current filters
  const articlesQuery = useQuery(
    trpc.articles.list.queryOptions({
      page: search.page,
      limit: 12,
      profile: search.profile,
      status: search.status,
      material: search.material,
      isNew: search.isNew,
      search: search.search,
    }),
  );

  const handleFilterChange = (
    key: "profile" | "status" | "material",
    value: string | ArticleStatus | ArticleMaterial | undefined,
  ) => {
    navigate({
      to: "/",
      search: {
        ...search,
        [key]: value,
        page: 1, // Reset to first page on filter change
      },
    });
  };

  const handleClearFilters = () => {
    navigate({
      to: "/",
      search: { page: 1 },
    });
  };

  const handlePageChange = (page: number) => {
    navigate({
      to: "/",
      search: {
        ...search,
        page,
      },
    });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{i18n.articles.title}</h1>
      </header>

      {/* Filters */}
      <section className="mb-6">
        <ArticleFilters
          profiles={profilesQuery.data ?? []}
          selectedProfile={search.profile}
          selectedStatus={search.status}
          selectedMaterial={search.material}
          onProfileChange={(v) => handleFilterChange("profile", v)}
          onStatusChange={(v) => handleFilterChange("status", v)}
          onMaterialChange={(v) => handleFilterChange("material", v)}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </section>

      {/* Articles Grid */}
      <section className="mb-8">
        {articlesQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : articlesQuery.data?.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
            <p className="text-red-600 dark:text-red-400">
              {i18n.common.error}: {articlesQuery.data.error}
            </p>
          </div>
        ) : articlesQuery.data?.docs.length === 0 ? (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">{i18n.common.noResults}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articlesQuery.data?.docs.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {articlesQuery.data && articlesQuery.data.totalPages > 1 && (
        <ArticlesPagination
          currentPage={articlesQuery.data.page}
          totalPages={articlesQuery.data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
