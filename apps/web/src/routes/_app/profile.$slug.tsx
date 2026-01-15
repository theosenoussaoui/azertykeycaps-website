import type { AppRouter } from "@azertykeycaps-app/api/routers/index";
import {
  profilePageFiltersSchema,
  type ProfilePageFilters,
  type ArticleMaterial,
  type ArticleStatus,
} from "@azertykeycaps-app/schemas";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { ArticleCard } from "@/components/article-card";
import { ArticleFilters } from "@/components/article-filters";
import { ArticlesPagination } from "@/components/articles-pagination";
import { Button } from "@/components/ui/button";
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
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ params, deps: { search } }) => {
    const data = await getArticlesByProfile({
      data: { slug: params.slug, ...search },
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
          content: `Découvrez ${articleCount} keyset${articleCount > 1 ? "s" : ""} avec le profil ${profileTitle} sur Azertykeycaps.`,
        },
      ],
    };
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
      search: { page: 1 },
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

  if (articles.docs.length === 0 && !hasActiveFilters) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">{i18n.pages.profile.noArticles}</span>
          </h1>
          <p className="text-muted-foreground mt-4">{i18n.pages.profile.noArticlesDescription}</p>
          <Link to="/" search={{ page: 1 }} className="mt-8 inline-block">
            <Button variant="secondary">{i18n.common.backHome}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link to="/" search={{ page: 1 }}>
          <Button variant="ghost" size="sm">
            &larr; {i18n.common.back}
          </Button>
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold">{profileInfo?.title ?? profileSlug}</h1>
        {articles.totalDocs > 0 && (
          <p className="text-muted-foreground mt-2">
            {articles.totalDocs} article{articles.totalDocs > 1 ? "s" : ""}
          </p>
        )}
      </header>

      <section className="mb-6">
        <ArticleFilters
          showProfileFilter={false}
          selectedStatus={search.status}
          selectedMaterial={search.material}
          onStatusChange={(v) => handleFilterChange("status", v)}
          onMaterialChange={(v) => handleFilterChange("material", v)}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </section>

      <section className="mb-8">
        {articles.docs.length === 0 ? (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">{i18n.common.noResults}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.docs.map((article) => (
              <ArticleCard key={article.id} article={article} preload="viewport" />
            ))}
          </div>
        )}
      </section>

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
