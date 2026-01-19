import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { PageErrorWithBack } from "@/components/errors/page-error";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { getArticleBySlug } from "@/features/articles/api/get-article-by-slug";
import { ArticleContent } from "@/features/articles/components/article-content";
import { t } from "@/i18n";
import { getPreloadImageUrl } from "@/lib/image-utils";
import {
  generateArticleSchema,
  generateCanonical,
  generateJsonLd,
  generateMeta,
} from "@/lib/seo";

export const Route = createFileRoute("/_app/articles/$slug")({
  component: ArticleDetailPage,
  loader: async ({ params }) => {
    const article = await getArticleBySlug({ data: { slug: params.slug } });

    if (!article) {
      throw notFound();
    }

    return { article };
  },
  head: ({ loaderData, params }) => {
    const article = loaderData?.article;
    // Use optimized image URL for preloading (matches what OptimizedImage renders)
    const heroImageUrl = getPreloadImageUrl(article?.img.url, "hero");
    const path = `/articles/${params.slug}`;
    const i18n = t();

    return {
      meta: generateMeta({
        title: article?.title ?? "Article",
        description: article?.description ?? i18n.home.metaDescription,
        path,
        image: article?.img.url,
        type: "article",
      }),
      links: [
        generateCanonical(path),
        ...(heroImageUrl
          ? [
              {
                rel: "preload" as const,
                as: "image" as const,
                href: heroImageUrl,
              },
            ]
          : []),
      ],
      scripts: (article
        ? [
            generateJsonLd(
              generateArticleSchema({
                title: article.title,
                description: article.description ?? "",
                image: article.img.url,
                slug: article.slug,
                createdAt: article.createdAt,
                updatedAt: article.updatedAt,
              }),
            ),
          ]
        : []
      ).filter(Boolean),
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
    <PageContainer>
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
