import type { HomePageDataResponse } from "@azertykeycaps-app/schemas";
import { createServerFn } from "@tanstack/react-start";

import { serverFetch } from "@/lib/server-fetch";

export const getHomePageData = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomePageDataResponse> => {
    return serverFetch<HomePageDataResponse>("/api/pages/home");
  },
);
