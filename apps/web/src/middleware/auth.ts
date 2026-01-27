import { createMiddleware } from "@tanstack/react-start";

import { getServerSession } from "@/lib/server-auth";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await getServerSession(request.headers);

    return next({
      context: { session },
    });
  },
);
