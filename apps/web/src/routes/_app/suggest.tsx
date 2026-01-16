import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ClockIcon, AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { serverTRPCClient } from "@/lib/server-trpc";

// Server function to fetch suggestion page content
// Uses module-scoped tRPC client for reduced cold start time
const getSuggestPageContent = createServerFn({ method: "GET" }).handler(async () => {
  return await serverTRPCClient.globals.suggestionPage.query();
});

export const Route = createFileRoute("/_app/suggest")({
  component: SuggestPage,
  loader: async () => {
    const content = await getSuggestPageContent();
    return { content };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 60 * 60_000, // Client considers data fresh for 1 hour
  gcTime: 24 * 60 * 60_000, // Keep in memory for 24 hours
  head: () => {
    const i18n = t();
    return {
      meta: [
        {
          title: i18n.pages.suggest.metaTitle,
        },
        {
          name: "description",
          content: i18n.pages.suggest.metaDescription,
        },
      ],
    };
  },
  errorComponent: () => {
    const router = useRouter();
    const i18n = t();
    return (
      <PageContainer size="md">
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

function SuggestPage() {
  const { content } = Route.useLoaderData();
  const i18n = t();

  return (
    <PageContainer size="md">
      <PageHeader>
        <PageTitle>{content?.title ?? i18n.pages.suggest.title}</PageTitle>
        <PageDescription>{content?.description ?? i18n.pages.suggest.description}</PageDescription>
      </PageHeader>

      <PageSection>
        <PageSectionContent>
          <Alert variant="info">
            <ClockIcon className="size-4" />
            <AlertDescription>{i18n.pages.suggest.comingSoon}</AlertDescription>
          </Alert>
        </PageSectionContent>
      </PageSection>
    </PageContainer>
  );
}
