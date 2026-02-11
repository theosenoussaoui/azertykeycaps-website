import { Hr, Section, Text } from "@react-email/components";
import * as React from "react";

export function Header() {
  return (
    <Section>
      <Text className="m-0 text-lg font-bold uppercase tracking-tight text-foreground">
        AZERTYKEYCAPS
      </Text>
      <Hr className="my-4 border-border" />
    </Section>
  );
}
