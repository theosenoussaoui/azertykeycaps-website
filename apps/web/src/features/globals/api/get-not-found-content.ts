import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

export const getNotFoundContent = createServerFn({ method: "GET" }).handler(
  async () => {
    return await serverTRPCClient.globals.notFoundPage.query();
  },
);
