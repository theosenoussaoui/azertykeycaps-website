import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AlertCircleIcon } from "lucide-react";

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
  PageSection,
  PageSectionContent,
} from "@/components/ui/page-container";
import { t } from "@/i18n";
import { serverTRPCClient } from "@/lib/server-trpc";

// Server function to fetch about page content
// Uses module-scoped tRPC client for reduced cold start time
const getAboutPageContent = createServerFn({ method: "GET" }).handler(async () => {
  return await serverTRPCClient.globals.informationsPage.query();
});

export const Route = createFileRoute("/_app/about")({
  component: AboutPage,
  loader: async () => {
    const content = await getAboutPageContent();
    return { content };
  },
  head: () => {
    const i18n = t();
    return {
      meta: [
        {
          title: i18n.pages.about.metaTitle,
        },
        {
          name: "description",
          content: i18n.pages.about.metaDescription,
        },
      ],
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 60 * 60_000, // Client considers data fresh for 1 hour
  gcTime: 24 * 60 * 60_000, // Keep in memory for 24 hours
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

function AboutPage() {
  const { content } = Route.useLoaderData();
  const i18n = t();

  return (
    <PageContainer size="md">
      <article>
        <PageHeader>
          <PageTitle>{content?.title ?? i18n.pages.about.title}</PageTitle>
        </PageHeader>

        <PageSection spacing="none">
          <PageSectionContent className="prose prose-neutral dark:prose-invert max-w-none">
            {content?.content ? (
              <RichTextContent content={content.content} />
            ) : (
              <p className="text-muted-foreground">{i18n.pages.about.metaDescription}</p>
            )}
          </PageSectionContent>
        </PageSection>
      </article>
    </PageContainer>
  );
}

// Simple rich text renderer for Lexical content
function RichTextContent({ content }: { content: unknown }) {
  // For now, we'll just stringify the content or render a placeholder
  // In production, you'd use @payloadcms/richtext-lexical/client or similar
  if (!content) return null;

  // If content is already a string, render it
  if (typeof content === "string") {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  // If it's Lexical JSON, we need to parse it
  // For now, display a message that content is available
  return <p className="text-muted-foreground">Le contenu de cette page est gere via le CMS.</p>;
}
