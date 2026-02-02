import type { WebEnv } from "@azertykeycaps-app/env/types";

import { serverEnv } from "@/lib/server-env";

let cachedEnv: WebEnv | null = null;

async function getCloudflareEnv(): Promise<WebEnv | null> {
  if (cachedEnv) return cachedEnv;

  try {
    const mod = await import("cloudflare:workers");
    cachedEnv = mod.env as unknown as WebEnv;
    return cachedEnv;
  } catch {
    return null;
  }
}

interface ServerFetchOptions {
  timeout?: number;
}

/**
 * Fetch data from the server using service binding (production) or HTTP (local dev).
 * Provides consistent error handling and timeout support.
 */
export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const { timeout = 25000 } = options;
  const env = await getCloudflareEnv();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = env?.SERVER
      ? await env.SERVER.fetch(new Request(`https://server${path}`), {
          signal: controller.signal,
        })
      : await fetch(`${serverEnv.SERVER_URL}${path}`, {
          signal: controller.signal,
        });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Server request timed out: ${path}`);
    }
    throw error;
  }
}
