import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import SignInForm from "@/features/auth/components/sign-in-form";
import SignUpForm from "@/features/auth/components/sign-up-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
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
