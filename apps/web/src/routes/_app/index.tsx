import type { AppRouter } from "@azertykeycaps-app/api/routers/index";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import {
  articleFiltersSchema,
  type ArticleFilters as ArticleFiltersType,
  type ArticleMaterial,
  type ArticleStatus,
} from "@azertykeycaps-app/schemas";

import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { ArticlesPagination } from "@/components/articles-pagination";
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

// Server function to fetch home page data (articles + profiles for filters)
const getHomePageData = createServerFn({ method: "GET" })
  .inputValidator((data: ArticleFiltersType) => data)
  .handler(async ({ data: filters }) => {
    const client = createServerTRPCClient();

    const [articles, profiles] = await Promise.all([
      client.articles.list.query({
        page: filters.page ?? 1,
        limit: 12,
        profile: filters.profile,
        status: filters.status,
        material: filters.material,
        isNew: filters.isNew,
        search: filters.search,
      }),
      client.articles.profiles.query({ limit: 100 }),
    ]);

    return { articles, profiles };
  });

export const Route = createFileRoute("/_app/")({
  component: HomeComponent,
  validateSearch: articleFiltersSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => {
    const data = await getHomePageData({ data: search });
    return data;
  },
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  head: () => {
    const i18n = t();
    return {
      meta: [
        { title: i18n.articles.metaTitle },
        { name: "description", content: i18n.articles.metaDescription },
      ],
    };
  },
});

function HomeComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { articles, profiles } = Route.useLoaderData();
  const i18n = t();

  // Check if any filters are active
  const hasActiveFilters = !!(search.profile || search.status || search.material);

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
          profiles={profiles}
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
        {articles.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
            <p className="text-red-600 dark:text-red-400">
              {i18n.common.error}: {articles.error}
            </p>
          </div>
        ) : articles.docs.length === 0 ? (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">{i18n.common.noResults}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.docs.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {articles.totalPages > 1 && (
        <ArticlesPagination
          currentPage={articles.page}
          totalPages={articles.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
