import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import SignInForm from "@/features/auth/components/sign-in-form";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { generateCanonical, generateMeta } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  head: () => ({
    meta: [
      ...generateMeta({
        title: "Sign In",
        description:
          "Sign in to your Azertykeycaps account or create a new one.",
        path: "/login",
      }),
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [generateCanonical("/login")],
  }),
  headers: () => ({
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
  }),
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
