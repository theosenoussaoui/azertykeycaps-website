import type { LayoutData } from "@/routes/_app";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, LightbulbIcon } from "lucide-react";
import { z } from "zod";

import { PageError } from "@/components/errors/page-error";
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
import { getArticleBySlug } from "@/features/articles/api/get-article-by-slug";
import { getSuggestContent } from "@/features/globals/api/get-suggest-content";
import { getLayoutData } from "@/features/pages/api/get-layout-data";
import { getProfilesForForm } from "@/features/suggestions/api/get-profiles-for-form";
import { SuggestionForm } from "@/features/suggestions/components/suggestion-form";
import { defaultLocale, t } from "@/i18n";
import { buildCacheHeaders } from "@/lib/cache-tags";
import {
  generateCanonical,
  generateJsonLd,
  generateMeta,
  generateWebPageSchema,
} from "@/lib/seo";

const searchSchema = z.object({
  slug: z.string().optional(),
});

export const Route = createFileRoute("/_app/suggest")({
  component: SuggestPage,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ slug: search.slug }),
  loader: async ({ deps }) => {
    const [content, profiles, layout, articleToEdit, i18n] = await Promise.all([
      getSuggestContent(),
      getProfilesForForm(),
      getLayoutData(),
      deps.slug ? getArticleBySlug({ data: { slug: deps.slug } }) : null,
      t(),
    ]);
    const layoutData: LayoutData = {
      profiles: layout.profiles,
      socialNetworks: layout.socialNetworks,
    };
    return {
      content,
      profiles,
      articleToEdit,
      layoutData,
      i18n,
      locale: defaultLocale,
    };
  },
  headers: () => buildCacheHeaders({ global: ["suggest"] }),
  staleTime: 60 * 60_000,
  gcTime: 24 * 60 * 60_000,
  head: ({ loaderData }) => {
    const i18n = loaderData?.i18n ?? t();
    const content = loaderData?.content;

    // Use CMS content with i18n fallbacks
    const title = content?.title ?? i18n.pages.suggest.title;
    const description =
      content?.meta?.description ??
      content?.description ??
      i18n.pages.suggest.metaDescription;

    return {
      meta: generateMeta({
        title,
        description,
        path: "/suggest",
        seo: content,
      }),
      links: [generateCanonical("/suggest")],
      scripts: [
        generateJsonLd(
          generateWebPageSchema({
            name: title,
            description,
            path: "/suggest",
          }),
        ),
      ].filter(Boolean),
    };
  },
  errorComponent: PageError,
});

function SuggestPage() {
  const { content, profiles, articleToEdit, i18n, locale } =
    Route.useLoaderData();

  return (
    <PageContainer>
      <PageHeader className="min-h-0 py-8 @sm:py-10 @md:py-12">
        <PageTitle>{content?.title ?? i18n.pages.suggest.title}</PageTitle>
        <PageDescription>
          {content?.description ?? i18n.pages.suggest.description}
        </PageDescription>
      </PageHeader>

      <PageSection spacing="none">
        <PageSectionContent>
          {content?.formEnabled ? (
            <CardGrid>
              <GridCard className="col-span-2 border-y border-border/60 md:col-span-6">
                <SuggestionForm
                  profiles={profiles}
                  editingArticle={articleToEdit}
                  i18n={i18n}
                  locale={locale}
                />
              </GridCard>
            </CardGrid>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LightbulbIcon />
                </EmptyMedia>
                <EmptyTitle as="h2">{i18n.pages.suggest.comingSoon}</EmptyTitle>
                <EmptyDescription>
                  {i18n.pages.suggest.comingSoonDescription}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="secondary" render={<Link to="/" />}>
                  {i18n.pages.suggest.browseExisting}
                  <ArrowRightIcon />
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </PageSectionContent>
      </PageSection>
    </PageContainer>
  );
}
