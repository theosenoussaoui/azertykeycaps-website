import type { LayoutData } from "@/routes/_app";
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
import { getLayoutData } from "@/features/pages/api/get-layout-data";
import { t } from "@/i18n";
import { buildCacheHeaders } from "@/lib/cache-tags";
import {
  generateAboutPageSchema,
  generateCanonical,
  generateJsonLd,
  generateMeta,
} from "@/lib/seo";

export const Route = createFileRoute("/_app/about")({
  component: AboutPage,
  loader: async () => {
    const [content, layout, i18n] = await Promise.all([
      getAboutContent(),
      getLayoutData(),
      t(),
    ]);
    const layoutData: LayoutData = {
      profiles: layout.profiles,
      socialNetworks: layout.socialNetworks,
    };
    return { content, layoutData, i18n };
  },
  head: ({ loaderData }) => {
    const i18n = loaderData?.i18n ?? t();
    const content = loaderData?.content;

    // Use CMS content with i18n fallbacks
    const title = content?.title ?? i18n.pages.about.title;
    const description =
      content?.meta?.description ?? i18n.pages.about.metaDescription;

    return {
      meta: generateMeta({
        title,
        description,
        path: "/about",
        seo: content,
      }),
      links: [generateCanonical("/about")],
      scripts: [
        generateJsonLd(
          generateAboutPageSchema({
            name: title,
            description,
          }),
        ),
      ].filter(Boolean),
    };
  },
  headers: () => buildCacheHeaders({ global: ["about"] }),
  staleTime: 60 * 60_000,
  gcTime: 24 * 60 * 60_000,
  errorComponent: PageError,
});

function AboutPage() {
  const { content, i18n } = Route.useLoaderData();

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
