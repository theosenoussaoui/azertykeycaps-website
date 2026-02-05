import {
  suggestionInputSchema,
  suggestionResponseSchema,
  type SuggestionResponse,
} from "@azertykeycaps-app/schemas";

import { publicProcedure, router } from "../index";

export const suggestionsRouter = router({
  submit: publicProcedure
    .input(suggestionInputSchema)
    .output(suggestionResponseSchema)
    .mutation(async ({ input }): Promise<SuggestionResponse> => {
      console.log("[suggestions.submit] Received suggestion:", {
        type: input.type,
        title: input.title,
        email: input.email,
        editingSlug: input.editingSlug,
      });

      return { success: true, message: "Suggestion received" };
    }),
});
