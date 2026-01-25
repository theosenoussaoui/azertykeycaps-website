import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import Loader from "@/components/layout/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/features/auth/lib/auth-client";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="name">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    autoComplete="name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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
        </div>

        <div>
          <form.Field name="email">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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
        </div>

        <div>
          <form.Field name="password">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const errorId = `${field.name}-error`;
              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Submitting..." : "Sign Up"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button variant="link" onClick={onSwitchToSignIn}>
          Already have an account? Sign In
        </Button>
      </div>
    </div>
  );
}
