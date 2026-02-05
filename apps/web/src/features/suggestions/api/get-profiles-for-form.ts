import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

export const getProfilesForForm = createServerFn({ method: "GET" }).handler(
  async () => {
    return await serverTRPCClient.articles.profiles.query({ limit: 100 });
  },
);
