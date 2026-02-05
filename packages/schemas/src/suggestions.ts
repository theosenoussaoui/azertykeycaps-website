import { z } from "zod";

import { articleMaterialSchema, articleStatusSchema } from "./articles";

export const suggestionTypeSchema = z.enum(["new", "edit"]);

export type SuggestionType = z.infer<typeof suggestionTypeSchema>;

export interface SuggestionFormTranslations {
  required: string;
  invalidUrl: string;
  invalidEmail: string;
}

export const createSuggestionFormSchema = (t: SuggestionFormTranslations) =>
  z.object({
    title: z.string().min(1, t.required),
    url: z.url(t.invalidUrl),
    profileId: z.string().min(1, t.required),
    email: z.email(t.invalidEmail),
    description: z.string().optional(),
    material: articleMaterialSchema.optional(),
    status: articleStatusSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    additionalUrl: z.url(t.invalidUrl).optional().or(z.literal("")),
    warningText: z.string().optional(),
  });

export const suggestionInputSchema = z.object({
  type: suggestionTypeSchema,
  editingSlug: z.string().optional(),
  title: z.string().min(1),
  url: z.url(),
  profileId: z.string().min(1),
  email: z.email(),
  description: z.string().optional(),
  material: articleMaterialSchema.optional(),
  status: articleStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  additionalUrl: z.url().optional().or(z.literal("")),
  warningText: z.string().optional(),
});

export const suggestionFormSchema = suggestionInputSchema.omit({
  type: true,
  editingSlug: true,
});

export const suggestionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type SuggestionInput = z.infer<typeof suggestionInputSchema>;
export type SuggestionFormData = z.infer<typeof suggestionFormSchema>;
export type SuggestionResponse = z.infer<typeof suggestionResponseSchema>;
