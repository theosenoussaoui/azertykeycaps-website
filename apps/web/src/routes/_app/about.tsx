import type { AppRouter } from "@azertykeycaps-app/api/routers/index";

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { t } from "@/i18n";
import { serverEnv } from "@/lib/server-env";

// Create a server-side tRPC client
function createServerTRPCClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${serverEnv.SERVER_URL}/trpc`,
      }),
    ],
  });
}

// Server function to fetch about page content
const getAboutPageContent = createServerFn({ method: "GET" }).handler(async () => {
  const client = createServerTRPCClient();
  return await client.globals.informationsPage.query();
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
});

function AboutPage() {
  const { content } = Route.useLoaderData();
  const i18n = t();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <article className="prose dark:prose-invert max-w-none">
        <h1>{content?.title ?? i18n.pages.about.title}</h1>
        {content?.content ? (
          <RichTextContent content={content.content} />
        ) : (
          <p className="text-muted-foreground">{i18n.pages.about.metaDescription}</p>
        )}
      </article>
    </div>
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
  return (
    <div className="text-muted-foreground">
      <p>Le contenu de cette page est géré via le CMS.</p>
    </div>
  );
}
