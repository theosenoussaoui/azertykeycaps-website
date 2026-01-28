import "./styles.css";

import { redirect } from "next/navigation";

import config from "@/payload.config";

export default async function HomePage() {
  const payloadConfig = await config;
  return redirect(payloadConfig.routes.admin);
}
