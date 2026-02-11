import { Hr, Link, Section, Text } from "@react-email/components";
import * as React from "react";

export function Footer() {
  return (
    <Section>
      <Hr className="my-4 border-border" />
      <Text className="m-0 text-xs text-muted-foreground">
        <Link
          href="https://azertykeycaps.fr"
          className="text-muted-foreground underline"
        >
          azertykeycaps.fr
        </Link>
      </Text>
    </Section>
  );
}
