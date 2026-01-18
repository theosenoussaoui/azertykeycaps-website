import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { PageErrorWithBack } from "@/components/errors/page-error";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { getArticleBySlug } from "@/features/articles/api/get-article-by-slug";
import { ArticleContent } from "@/features/articles/components/article-content";
import { t } from "@/i18n";
import { getPreloadImageUrl } from "@/lib/image-utils";

export const Route = createFileRoute("/_app/articles/$slug")({
  component: ArticleDetailPage,
  loader: async ({ params }) => {
    const article = await getArticleBySlug({ data: { slug: params.slug } });

    if (!article) {
      throw notFound();
    }

    return { article };
  },
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    // Use optimized image URL for preloading (matches what OptimizedImage renders)
    const heroImageUrl = getPreloadImageUrl(article?.img.url, "hero");

    return {
      meta: [
        {
          title: article
            ? `${article.title} - Azertykeycaps`
            : "Article - Azertykeycaps",
        },
        {
          name: "description",
          content:
            article?.description ?? "Decouvrez ce keyset sur Azertykeycaps.",
        },
      ],
      links: heroImageUrl
        ? [
            {
              rel: "preload",
              as: "image",
              href: heroImageUrl,
            },
          ]
        : [],
    };
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  errorComponent: PageErrorWithBack,
});

function ArticleDetailPage() {
  const { article } = Route.useLoaderData();
  const i18n = t();

  return (
    <PageContainer size="md">
      {/* Back Navigation */}
      <nav className="py-4">
        <Button variant="ghost" size="sm" render={<Link to="/" />}>
          <ArrowLeftIcon />
          {i18n.common.back}
        </Button>
      </nav>

      <ArticleContent article={article} />
    </PageContainer>
  );
}
