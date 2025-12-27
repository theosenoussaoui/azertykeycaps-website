import { hc } from "hono/client";
import type { AppType } from "server";

const serverUrl = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

export const rpcClient = hc<AppType>(serverUrl);

export type { InferRequestType, InferResponseType } from "hono/client";
