"use client";

import { FieldLabel, TextInput, useField, useFormFields } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import { useCallback, useEffect, useRef } from "react";
import slugify from "slugify";

/**
 * Custom slug field that auto-generates from title in real-time.
 * Shows live preview as user types the title.
 *
 * Uses useFormFields to watch title changes and automatically
 * generates a URL-friendly slug using slugify.
 */
export const SlugField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path });
  const hasManualEdit = useRef(false);
  const lastAutoSlug = useRef<string>("");

  // Watch the title field for changes
  const title = useFormFields(([fields]) => {
    const titleField = fields.title;
    return typeof titleField?.value === "string" ? titleField.value : "";
  });

  // Memoize slug generation to avoid recreating on every render
  const generateSlug = useCallback((titleValue: string): string => {
    if (!titleValue) return "";
    return slugify(titleValue, {
      lower: true,
      strict: true,
      locale: "fr",
    });
  }, []);

  // Auto-update slug when title changes
  useEffect(() => {
    if (!title) {
      // If title is cleared, also clear slug
      if (!hasManualEdit.current) {
        setValue("");
        lastAutoSlug.current = "";
      }
      return;
    }

    const newSlug = generateSlug(title);

    // Only auto-update if:
    // 1. No manual edit has been made, OR
    // 2. Current value matches the last auto-generated slug
    if (!hasManualEdit.current || value === lastAutoSlug.current) {
      setValue(newSlug);
      lastAutoSlug.current = newSlug;
      hasManualEdit.current = false;
    }
  }, [title, generateSlug, setValue, value]);

  // Handle manual changes - mark as manually edited
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      hasManualEdit.current = newValue !== lastAutoSlug.current;
      setValue(newValue);
    },
    [setValue],
  );

  // Extract label with proper i18n handling
  const label =
    typeof field.label === "object"
      ? field.label.en || field.label.fr || "Slug"
      : field.label || "Slug";

  // Extract description with proper i18n handling
  const description =
    typeof field.admin?.description === "object"
      ? field.admin.description.en || field.admin.description.fr
      : field.admin?.description;

  return (
    <div className="field-type text">
      <FieldLabel label={label} path={path} required={field.required} />
      <TextInput
        path={path}
        value={value || ""}
        onChange={handleChange}
        readOnly={field.admin?.readOnly}
      />
      {description && <div className="field-description">{description}</div>}
    </div>
  );
};

export default SlugField;
