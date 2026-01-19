import { protectedProcedure, publicProcedure, router } from "../index";

import { articlesRouter } from "./articles";
import { globalsRouter } from "./globals";
import { searchRouter } from "./search";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  articles: articlesRouter,
  globals: globalsRouter,
  search: searchRouter,
});
export type AppRouter = typeof appRouter;
