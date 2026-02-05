import type { SuggestionInput } from "@azertykeycaps-app/schemas";
import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

export const submitSuggestion = createServerFn({ method: "POST" })
  .inputValidator((data: SuggestionInput) => data)
  .handler(async ({ data }) => {
    return await serverTRPCClient.suggestions.submit.mutate(data);
  });
