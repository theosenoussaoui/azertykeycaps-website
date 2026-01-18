import { createFileRoute, redirect } from "@tanstack/react-router";

import { getPrivateData } from "@/features/auth/api/get-private-data";
import { getUser } from "@/features/auth/api/get-user";

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
  headers: () => ({
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
  }),
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { privateData } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome {session?.user.name}</p>
        </div>

        <div className="border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Server-Side Secure Data
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This data was fetched{" "}
              <span className="font-semibold text-green-600">
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
          <div className="mt-4 bg-green-50 p-4 text-sm dark:bg-green-950">
            <p className="font-medium text-green-900 dark:text-green-100">
              Security Benefits:
            </p>
            <ul className="mt-2 space-y-1 text-green-800 dark:text-green-200">
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
      </div>
    </div>
  );
}
