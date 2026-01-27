import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PageErrorWithBack } from "@/components/errors/page-error";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CardGrid, GridCard } from "@/components/ui/card-grid";
import {
  PageContainer,
  PageSection,
  PageSectionContent,
  PageSectionHeader,
  PageSectionTitle,
} from "@/components/ui/page-container";
import { SectionDivider } from "@/components/ui/section-divider";
import { getArticleBySlug } from "@/features/articles/api/get-article-by-slug";
import { getRelatedArticles } from "@/features/articles/api/get-related-articles";
import { ArticleCard } from "@/features/articles/components/article-card";
import { ArticleContent } from "@/features/articles/components/article-content";
import { t } from "@/i18n";
import { buildCacheHeaders } from "@/lib/cache-tags";
import { getPreloadLinkAttributes } from "@/lib/image-utils";
import {
  generateArticleSchema,
  generateCanonical,
  generateJsonLd,
  generateMeta,
} from "@/lib/seo";

export const Route = createFileRoute("/_app/articles/$slug")({
  component: ArticleDetailPage,
  loader: async ({ params }) => {
    const [article, i18n] = await Promise.all([
      getArticleBySlug({ data: { slug: params.slug } }),
      t(),
    ]);

    if (!article) {
      throw notFound();
    }

    // Fetch related articles (same profile, excluding current)
    const relatedArticles = article.profile
      ? await getRelatedArticles({
          data: {
            profileSlug: article.profile.slug,
            excludeSlug: article.slug,
            limit: 4,
          },
        })
      : { docs: [] };

    return { article, relatedArticles: relatedArticles.docs, i18n };
  },
  head: ({ loaderData, params }) => {
    const article = loaderData?.article;
    // Use enhanced preload with responsive hints for optimal LCP
    const preloadLink = getPreloadLinkAttributes(article?.img.url, "hero");
    const path = `/articles/${params.slug}`;
    const i18n = loaderData?.i18n ?? t();

    // Use CMS SEO data with fallbacks to article content
    const title = article?.title ?? "Article";
    const description = article?.description ?? i18n.home.subtitle;

    return {
      meta: generateMeta({
        title,
        description,
        path,
        image: article?.img.url,
        type: "article",
        seo: article,
      }),
      links: [generateCanonical(path), ...(preloadLink ? [preloadLink] : [])],
      scripts: (article
        ? [
            generateJsonLd(
              generateArticleSchema({
                title: article.meta?.title ?? article.title,
                description:
                  article.meta?.description ?? article.description ?? "",
                image: article.meta?.image?.url ?? article.img.url,
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
  headers: ({ loaderData }) =>
    buildCacheHeaders({
      articleSlug: loaderData?.article?.slug,
      profileArticlesSlug: loaderData?.article?.profile?.slug,
    }),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  errorComponent: PageErrorWithBack,
});

function ArticleDetailPage() {
  const { article, relatedArticles, i18n } = Route.useLoaderData();

  return (
    <PageContainer>
      {/* Breadcrumb Navigation */}
      <nav className="py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/" />}>
                {i18n.nav.home}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {article.profile && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    render={
                      <Link
                        to="/profile/$slug"
                        params={{ slug: article.profile.slug }}
                      />
                    }
                  >
                    {article.profile.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-48 truncate">
                {article.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <ArticleContent article={article} />

      {/* Related Keysets Section */}
      {relatedArticles.length > 0 && (
        <PageSection>
          <PageSectionHeader>
            <PageSectionTitle>{i18n.articles.related}</PageSectionTitle>
          </PageSectionHeader>
          <PageSectionContent>
            <SectionDivider />
            <CardGrid as="ul">
              {relatedArticles.map((relatedArticle) => (
                <GridCard
                  key={relatedArticle.id}
                  as="li"
                  className="col-span-2 md:col-span-2"
                >
                  <ArticleCard
                    article={relatedArticle}
                    preload="intent"
                    variant="grid"
                  />
                </GridCard>
              ))}
            </CardGrid>
            <SectionDivider />
          </PageSectionContent>
        </PageSection>
      )}
    </PageContainer>
  );
}
