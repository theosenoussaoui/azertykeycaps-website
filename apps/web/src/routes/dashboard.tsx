import { createFileRoute, redirect } from "@tanstack/react-router";

import {
  PageContainer,
  PageDescription,
  PageHeader,
  PageSection,
  PageSectionContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getPrivateData } from "@/features/auth/api/get-private-data";
import { getUser } from "@/features/auth/api/get-user";
import { generateMeta } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }

    const privateData = await getPrivateData();
    return { privateData };
  },
  head: () => ({
    meta: [
      ...generateMeta({
        title: "Dashboard",
        description: "Your personal dashboard",
        path: "/dashboard",
      }),
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  headers: () => ({
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
  }),
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { privateData } = Route.useLoaderData();

  return (
    <PageContainer size="6xl">
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
        <PageDescription>Welcome {session?.user.name}</PageDescription>
      </PageHeader>

      <PageSection>
        <PageSectionContent className="space-y-6">
          <div className="border bg-card p-6">
            <h2 className="mb-4 font-heading text-xl font-semibold">
              Server-Side Secure Data
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This data was fetched{" "}
                <span className="font-semibold text-success">
                  server-side only
                </span>
                :
              </p>
              <div className="bg-muted p-4">
                <p className="font-mono text-sm">{privateData.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  User: {privateData.user.email}
                </p>
              </div>
            </div>
            <div className="mt-4 bg-success/5 p-4 text-sm">
              <p className="font-medium text-success-foreground">
                Security Benefits:
              </p>
              <ul
                className="mt-2 space-y-1 text-success-foreground/80"
                role="list"
              >
                <li>No tRPC endpoint exposed to browser</li>
                <li>Data fetched with server credentials</li>
                <li>Zero client-side API calls</li>
                <li>Pre-rendered on server (SEO friendly)</li>
              </ul>
            </div>
          </div>

          <div className="border bg-muted/50 p-4 text-sm">
            <p className="font-medium">Compare with Home page:</p>
            <p className="mt-2 text-muted-foreground">
              The home page uses client-side queries (visible in Network tab).
              This page fetches everything server-side - check your Network tab,
              you'll see no tRPC calls!
            </p>
          </div>
        </PageSectionContent>
      </PageSection>
    </PageContainer>
  );
}
