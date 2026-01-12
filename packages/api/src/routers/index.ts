import { protectedProcedure, publicProcedure, router } from "../index";
import { articlesRouter } from "./articles";
import { globalsRouter } from "./globals";

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
});
export type AppRouter = typeof appRouter;
