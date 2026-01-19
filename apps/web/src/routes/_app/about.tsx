import { createFileRoute } from "@tanstack/react-router";

import { PageError } from "@/components/errors/page-error";
import {
  PageContainer,
  PageHeader,
  PageSection,
  PageSectionContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getAboutContent } from "@/features/globals/api/get-about-content";
import { RichTextContent } from "@/features/globals/components/rich-text-content";
import { t } from "@/i18n";

export const Route = createFileRoute("/_app/about")({
  component: AboutPage,
  loader: async () => {
    const content = await getAboutContent();
    return { content };
  },
  head: () => {
    const i18n = t();
    return {
      meta: [
        { title: i18n.pages.about.metaTitle },
        { name: "description", content: i18n.pages.about.metaDescription },
      ],
    };
  },
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  staleTime: 60 * 60_000,
  gcTime: 24 * 60 * 60_000,
  errorComponent: PageError,
});

function AboutPage() {
  const { content } = Route.useLoaderData();
  const i18n = t();

  return (
    <PageContainer>
      <article>
        <PageHeader>
          <PageTitle>{content?.title ?? i18n.pages.about.title}</PageTitle>
        </PageHeader>

        <PageSection spacing="none">
          <PageSectionContent className="prose prose-neutral dark:prose-invert max-w-none">
            {content?.content ? (
              <RichTextContent content={content.content} />
            ) : (
              <p className="text-muted-foreground">
                {i18n.pages.about.metaDescription}
              </p>
            )}
          </PageSectionContent>
        </PageSection>
      </article>
    </PageContainer>
  );
}
