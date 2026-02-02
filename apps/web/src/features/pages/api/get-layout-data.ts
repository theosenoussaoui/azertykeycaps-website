import type { LayoutDataResponse } from "@azertykeycaps-app/schemas";
import { createServerFn } from "@tanstack/react-start";

import { serverFetch } from "@/lib/server-fetch";

export const getLayoutData = createServerFn({ method: "GET" }).handler(
  async (): Promise<LayoutDataResponse> => {
    return serverFetch<LayoutDataResponse>("/api/pages/layout");
  },
);
