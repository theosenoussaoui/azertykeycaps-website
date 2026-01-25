import { createFileRoute, Link } from "@tanstack/react-router";
import { LightbulbIcon, ArrowRightIcon } from "lucide-react";

import { PageError } from "@/components/errors/page-error";
import { Button } from "@/components/ui/button";
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
import { getSuggestContent } from "@/features/globals/api/get-suggest-content";
import { t } from "@/i18n";
import {
  generateCanonical,
  generateJsonLd,
  generateMeta,
  generateWebPageSchema,
} from "@/lib/seo";

export const Route = createFileRoute("/_app/suggest")({
  component: SuggestPage,
  loader: async () => {
    const content = await getSuggestContent();
    return { content };
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 60 * 60_000,
  gcTime: 24 * 60 * 60_000,
  head: ({ loaderData }) => {
    const i18n = t();
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
  const { content } = Route.useLoaderData();
  const i18n = t();

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{content?.title ?? i18n.pages.suggest.title}</PageTitle>
        <PageDescription>
          {content?.description ?? i18n.pages.suggest.description}
        </PageDescription>
      </PageHeader>

      <PageSection>
        <PageSectionContent>
          {!content?.formEnabled && (
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
