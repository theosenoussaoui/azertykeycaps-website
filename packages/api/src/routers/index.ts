import { protectedProcedure, publicProcedure, router } from "../index";
import { articlesRouter } from "./articles";

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
});
export type AppRouter = typeof appRouter;
