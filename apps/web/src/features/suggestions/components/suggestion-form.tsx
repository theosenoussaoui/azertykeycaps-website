"use client";

import type { fr, en } from "@/i18n";
import {
  ARTICLE_MATERIAL_VALUES,
  ARTICLE_STATUS_VALUES,
  createSuggestionFormSchema,
  type Article,
  type ArticleMaterial,
  type ArticleStatus,
  type KeycapProfileRef,
  type SuggestionFormData,
} from "@azertykeycaps-app/schemas";
import { useForm } from "@tanstack/react-form";
import { useServerFn } from "@tanstack/react-start";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitSuggestion } from "@/features/suggestions/api/submit-suggestion";

type I18n = typeof fr | typeof en;

interface SuggestionFormProps {
  profiles: KeycapProfileRef[];
  editingArticle?: Article | null;
  i18n: I18n;
  locale?: "fr" | "en";
}

const emptyFormValues: SuggestionFormData = {
  title: "",
  url: "",
  profileId: "",
  email: "",
  description: "",
  material: undefined,
  status: undefined,
  startDate: "",
  endDate: "",
  additionalUrl: "",
  warningText: "",
};

export function SuggestionForm({
  profiles,
  editingArticle,
  i18n,
  locale = "fr",
}: SuggestionFormProps) {
  const submitFn = useServerFn(submitSuggestion);

  const isEditMode = !!editingArticle;
  const defaultValues: SuggestionFormData = editingArticle
    ? {
        title: editingArticle.title,
        url: editingArticle.url,
        profileId: editingArticle.profile?.id ?? "",
        email: "",
        description: editingArticle.description ?? "",
        material: editingArticle.material ?? undefined,
        status: editingArticle.status,
        startDate: editingArticle.startDate ?? "",
        endDate: editingArticle.endDate ?? "",
        additionalUrl: editingArticle.additionalUrl ?? "",
        warningText: editingArticle.warningText ?? "",
      }
    : {
        title: "",
        url: "",
        profileId: "",
        email: "",
        description: "",
        material: undefined,
        status: undefined,
        startDate: "",
        endDate: "",
        additionalUrl: "",
        warningText: "",
      };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        const result = await submitFn({
          data: {
            ...value,
            type: isEditMode ? "edit" : "new",
            editingSlug: editingArticle?.slug,
          },
        });

        if (result.success) {
          toast.success(i18n.pages.suggest.form.successTitle, {
            description: i18n.pages.suggest.form.successDescription,
            classNames: {
              title: "font-mono",
              description: "font-sans",
            },
          });
          form.reset(emptyFormValues);
        } else {
          toast.error(i18n.pages.suggest.form.errorTitle, {
            description:
              result.message ?? i18n.pages.suggest.form.errorDescription,
            classNames: {
              title: "font-mono",
              description: "font-sans",
            },
          });
        }
      } catch {
        toast.error(i18n.pages.suggest.form.errorTitle, {
          description: i18n.pages.suggest.form.errorDescription,
          classNames: {
            title: "font-mono",
            description: "font-sans",
          },
        });
      }
    },
    onSubmitInvalid: () => {
      const firstInvalid = document.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLInputElement;
      firstInvalid?.focus();
    },
    validators: {
      onSubmit: createSuggestionFormSchema(i18n.pages.suggest.form.validation),
    },
  });

  const getProfileLabel = (id: string) =>
    profiles.find((p) => p.id === id)?.title ?? "";

  const getMaterialLabel = (material: ArticleMaterial | undefined) =>
    material ? i18n.materials[material] : "";

  const getStatusLabel = (status: ArticleStatus | undefined) =>
    status ? i18n.status[status] : "";

  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardContent className="p-4">
        {isEditMode && (
          <Alert variant="info" className="mb-4">
            <InfoIcon className="size-4" />
            <AlertDescription>
              {i18n.pages.suggest.form.editingBanner}:{" "}
              <strong>{editingArticle.title}</strong>
            </AlertDescription>
          </Alert>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid gap-4 @md:grid-cols-2"
        >
          <form.Field name="title">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div>
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/90"
                  >
                    {i18n.pages.suggest.form.title} *
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    className="my-2"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={i18n.pages.suggest.form.titlePlaceholder}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? errorId : undefined}
                  />
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="profileId">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              const selectedLabel = getProfileLabel(field.state.value);
              return (
                <div>
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/90"
                  >
                    {i18n.pages.suggest.form.profile} *
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v ?? "")}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="my-2"
                      aria-invalid={hasErrors}
                      aria-describedby={hasErrors ? errorId : undefined}
                    >
                      <SelectValue
                        placeholder={i18n.pages.suggest.form.profilePlaceholder}
                      >
                        {selectedLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="url">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div>
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/90"
                  >
                    {i18n.pages.suggest.form.url} *
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    className="my-2"
                    type="url"
                    inputMode="url"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={i18n.pages.suggest.form.urlPlaceholder}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? errorId : undefined}
                  />
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="additionalUrl">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div>
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/90"
                  >
                    {i18n.pages.suggest.form.additionalUrl}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    className="my-2"
                    type="url"
                    inputMode="url"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={
                      i18n.pages.suggest.form.additionalUrlPlaceholder
                    }
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? errorId : undefined}
                  />
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="email">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div className="@md:col-span-2">
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/90"
                  >
                    {i18n.pages.suggest.form.email} *
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    className="my-2"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={i18n.pages.suggest.form.emailPlaceholder}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? errorId : undefined}
                  />
                  <p className="text-xs text-muted-foreground">
                    {i18n.pages.suggest.form.emailDescription}
                  </p>
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="material">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              const selectedLabel = getMaterialLabel(field.state.value);
              return (
                <div>
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/90"
                  >
                    {i18n.pages.suggest.form.material}
                  </Label>
                  <Select
                    value={field.state.value ?? ""}
                    onValueChange={(v) =>
                      field.handleChange(
                        (v || undefined) as ArticleMaterial | undefined,
                      )
                    }
                  >
                    <SelectTrigger
                      id={field.name}
                      className="my-2"
                      aria-invalid={hasErrors}
                      aria-describedby={hasErrors ? errorId : undefined}
                    >
                      <SelectValue
                        placeholder={
                          i18n.pages.suggest.form.materialPlaceholder
                        }
                      >
                        {selectedLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ARTICLE_MATERIAL_VALUES.map((material) => (
                        <SelectItem key={material} value={material}>
                          {i18n.materials[material]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="status">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              const selectedLabel = getStatusLabel(field.state.value);
              return (
                <div>
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/90"
                  >
                    {i18n.pages.suggest.form.status}
                  </Label>
                  <Select
                    value={field.state.value ?? ""}
                    onValueChange={(v) =>
                      field.handleChange(
                        (v || undefined) as ArticleStatus | undefined,
                      )
                    }
                  >
                    <SelectTrigger
                      id={field.name}
                      className="my-2"
                      aria-invalid={hasErrors}
                      aria-describedby={hasErrors ? errorId : undefined}
                    >
                      <SelectValue
                        placeholder={i18n.pages.suggest.form.statusPlaceholder}
                      >
                        {selectedLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ARTICLE_STATUS_VALUES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {i18n.status[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="startDate">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div>
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/90"
                  >
                    {i18n.pages.suggest.form.startDate}
                  </Label>
                  <DatePicker
                    id={field.name}
                    name={field.name}
                    className="my-2"
                    locale={locale}
                    value={
                      field.state.value
                        ? new Date(field.state.value)
                        : undefined
                    }
                    onChange={(date) =>
                      field.handleChange(
                        date?.toISOString().split("T")[0] ?? "",
                      )
                    }
                    onBlur={field.handleBlur}
                    placeholder={i18n.pages.suggest.form.startDatePlaceholder}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? errorId : undefined}
                  />
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="endDate">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div>
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/90"
                  >
                    {i18n.pages.suggest.form.endDate}
                  </Label>
                  <DatePicker
                    id={field.name}
                    name={field.name}
                    className="my-2"
                    locale={locale}
                    value={
                      field.state.value
                        ? new Date(field.state.value)
                        : undefined
                    }
                    onChange={(date) =>
                      field.handleChange(
                        date?.toISOString().split("T")[0] ?? "",
                      )
                    }
                    onBlur={field.handleBlur}
                    placeholder={i18n.pages.suggest.form.endDatePlaceholder}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? errorId : undefined}
                  />
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="description">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div className="@md:col-span-2">
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/90"
                  >
                    {i18n.pages.suggest.form.description}
                  </Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    className="my-2"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={i18n.pages.suggest.form.descriptionPlaceholder}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? errorId : undefined}
                  />
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="warningText">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div className="@md:col-span-2">
                  <Label
                    htmlFor={field.name}
                    className="font-mono text-xs font-semibold uppercase tracking-tighter text-white/9090"
                  >
                    {i18n.pages.suggest.form.warningText}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    className="my-2"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={i18n.pages.suggest.form.warningTextPlaceholder}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? errorId : undefined}
                  />
                  {hasErrors && (
                    <p
                      id={errorId}
                      className="text-sm text-destructive"
                      aria-live="polite"
                    >
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Subscribe>
            {(state) => (
              <Button
                type="submit"
                size="lg"
                className="w-full font-mono font-semibold tracking-tight uppercase @md:col-span-2"
                disabled={!state.canSubmit || state.isSubmitting}
              >
                {state.isSubmitting
                  ? i18n.pages.suggest.form.submitting
                  : i18n.pages.suggest.form.submit}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}
