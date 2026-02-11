import { Heading, Hr, Link, Section, Text } from "@react-email/components";
import * as React from "react";

import type { SuggestionInput } from "@azertykeycaps-app/schemas";

import { Layout } from "./_components/layout";

interface SuggestionNotificationProps
  extends Omit<SuggestionInput, "editingSlug"> {}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Text className="m-0 mb-1 text-xs font-bold uppercase tracking-tight text-muted-foreground">
        {label}
      </Text>
      <Text className="m-0 mb-4 text-sm text-foreground">{children}</Text>
    </div>
  );
}

export default function SuggestionNotification({
  type,
  title,
  url,
  profileId,
  email,
  description,
  material,
  status,
  startDate,
  endDate,
  additionalUrl,
  warningText,
}: SuggestionNotificationProps) {
  const isEdit = type === "edit";

  return (
    <Layout
      preview={`${isEdit ? "Edit" : "New"} suggestion: ${title}`}
    >
      <Section>
        <Heading as="h1" className="m-0 mb-2 text-xl font-bold text-foreground">
          {isEdit ? "Edit Suggestion" : "New Keyset Suggestion"}
        </Heading>
        <Text className="m-0 mb-6 text-sm text-muted-foreground">
          A user has submitted a {isEdit ? "modification" : "new keyset"}{" "}
          suggestion.
        </Text>
      </Section>

      <Hr className="my-2 border-border" />

      <Section className="py-4">
        <Field label="Title">{title}</Field>

        <Field label="URL">
          <Link href={url} className="text-foreground underline">
            {url}
          </Link>
        </Field>

        <Field label="Profile ID">{profileId}</Field>

        <Field label="Submitted by">
          <Link href={`mailto:${email}`} className="text-foreground underline">
            {email}
          </Link>
        </Field>

        {description && <Field label="Description">{description}</Field>}

        {material && <Field label="Material">{material}</Field>}

        {status && <Field label="Status">{status}</Field>}

        {startDate && <Field label="Start Date">{startDate}</Field>}

        {endDate && <Field label="End Date">{endDate}</Field>}

        {additionalUrl && (
          <Field label="Additional URL">
            <Link
              href={additionalUrl}
              className="text-foreground underline"
            >
              {additionalUrl}
            </Link>
          </Field>
        )}

        {warningText && <Field label="Warning">{warningText}</Field>}
      </Section>
    </Layout>
  );
}

SuggestionNotification.PreviewProps = {
  type: "new",
  title: "GMK Olivia",
  url: "https://example.com/gmk-olivia",
  profileId: "1",
  email: "user@example.com",
  description:
    "A beautiful keycap set featuring a soft pink and dark color scheme. Very popular in the community.",
  material: "abs_double_shot",
  status: "gb_running",
  startDate: "2026-03-01",
  endDate: "2026-04-15",
  additionalUrl: "https://geekhack.org/gmk-olivia",
  warningText: "Limited availability in AZERTY layout",
} satisfies SuggestionNotificationProps;
