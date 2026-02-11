import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  pixelBasedPreset,
} from "@react-email/components";
import * as React from "react";

import { Header } from "./header";
import { Footer } from "./footer";

const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        background: "#fefefe",
        foreground: "#0d0d0f",
        muted: "#f0f0f2",
        "muted-foreground": "#6b6b73",
        border: "#e0e0e5",
        primary: "#1a1a1e",
      },
    },
  },
};

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function Layout({ preview, children }: LayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className="mx-auto my-0 bg-background font-sans text-foreground">
          <Container className="mx-auto max-w-[600px] px-4 py-8">
            <Header />
            {children}
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
