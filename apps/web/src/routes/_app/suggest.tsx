import { createFileRoute } from "@tanstack/react-router";
import { ClockIcon } from "lucide-react";

import { PageError } from "@/components/errors/page-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  head: () => {
    const i18n = t();
    return {
      meta: generateMeta({
        title: i18n.pages.suggest.title,
        description: i18n.pages.suggest.metaDescription,
        path: "/suggest",
      }),
      links: [generateCanonical("/suggest")],
      scripts: [
        generateJsonLd(
          generateWebPageSchema({
            name: i18n.pages.suggest.title,
            description: i18n.pages.suggest.metaDescription,
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
            <Alert variant="info">
              <ClockIcon className="size-4" />
              <AlertDescription>
                {i18n.pages.suggest.comingSoon}
              </AlertDescription>
            </Alert>
          )}
        </PageSectionContent>
      </PageSection>
    </PageContainer>
  );
}
