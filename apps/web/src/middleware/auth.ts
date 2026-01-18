import { auth } from "@azertykeycaps-app/auth";
import { createMiddleware } from "@tanstack/react-start";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    // Use server-side auth API instead of client
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return next({
      context: { session },
    });
  },
);
