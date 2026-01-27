import type { Session, User } from "better-auth";

import { serverEnv } from "@/lib/server-env";

type SessionResponse = {
  session: Session;
  user: User;
} | null;

export async function getServerSession(
  headers: Headers,
): Promise<SessionResponse> {
  const response = await fetch(`${serverEnv.SERVER_URL}/api/auth/get-session`, {
    headers: {
      cookie: headers.get("cookie") || "",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data as SessionResponse;
}
