import type { Session, User } from "better-auth";

import { serverEnv } from "@/lib/server-env";

type SessionResponse = {
  session: Session;
  user: User;
} | null;

export async function getServerSession(
  headers: Headers,
): Promise<SessionResponse> {
  const url = `${serverEnv.SERVER_URL}/api/auth/get-session`;

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        cookie: headers.get("cookie") || "",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as SessionResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    // Auth errors should fail silently - user is simply not authenticated
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Auth session request timed out");
    }
    return null;
  }
}
