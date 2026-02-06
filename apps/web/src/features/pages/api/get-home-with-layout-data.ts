import type { HomeWithLayoutDataResponse } from "@azertykeycaps-app/schemas";
import { createServerFn } from "@tanstack/react-start";

import { serverFetch } from "@/lib/server-fetch";

export const getHomeWithLayoutData = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeWithLayoutDataResponse> => {
    return serverFetch<HomeWithLayoutDataResponse>(
      "/api/pages/home-with-layout",
    );
  },
);
