import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * PageContainer - A semantic container component with responsive sizing and container queries.
 *
 * Uses Tailwind v4 container queries (@container) for component-level responsive design.
 * Renders as <main> by default for semantic HTML.
 *
 * @example
 * ```tsx
 * <PageContainer size="md">
 *   <PageSection>Content here</PageSection>
 * </PageContainer>
 * ```
 */

const pageContainerVariants = cva("@container mx-auto w-full px-4 sm:px-6 lg:px-8", {
  defaultVariants: {
    size: "default",
  },
  variants: {
    size: {
      /** Full width - no max-width constraint */
      full: "",
      /** Large - max-width 80rem (1280px) */
      lg: "max-w-7xl",
      /** Default - max-width 64rem (1024px) */
      default: "max-w-5xl",
      /** Medium - max-width 48rem (768px) */
      md: "max-w-3xl",
      /** Small - max-width 36rem (576px) */
      sm: "max-w-xl",
      /** Narrow - max-width 28rem (448px) */
      narrow: "max-w-md",
    },
  },
});

interface PageContainerProps extends VariantProps<typeof pageContainerVariants> {
  className?: string;
  children?: React.ReactNode;
}

function PageContainer({
  className,
  size,
  children,
  ...props
}: PageContainerProps & React.ComponentProps<"main">) {
  return (
    <main
      className={cn(pageContainerVariants({ size }), className)}
      data-slot="page-container"
      {...props}
    >
      {children}
    </main>
  );
}

/**
 * PageContainerDiv - Same as PageContainer but renders as a div.
 * Use when nesting inside another landmark or when "main" is not semantically appropriate.
 */
function PageContainerDiv({
  className,
  size,
  children,
  ...props
}: PageContainerProps & React.ComponentProps<"div">) {
  return (
    <div
      className={cn(pageContainerVariants({ size }), className)}
      data-slot="page-container"
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * PageSection - A semantic section within a page container.
 *
 * Provides consistent vertical spacing and can contain an optional heading.
 *
 * @example
 * ```tsx
 * <PageSection>
 *   <PageSectionHeader>
 *     <PageSectionTitle>Section Title</PageSectionTitle>
 *     <PageSectionDescription>Optional description</PageSectionDescription>
 *   </PageSectionHeader>
 *   <PageSectionContent>
 *     Content goes here
 *   </PageSectionContent>
 * </PageSection>
 * ```
 */

const pageSectionVariants = cva("", {
  defaultVariants: {
    spacing: "default",
  },
  variants: {
    spacing: {
      none: "",
      sm: "py-4 @sm:py-6",
      default: "py-6 @sm:py-8 @md:py-12",
      lg: "py-8 @sm:py-12 @md:py-16",
      xl: "py-12 @sm:py-16 @md:py-24",
    },
  },
});

interface PageSectionProps
  extends React.ComponentProps<"section">, VariantProps<typeof pageSectionVariants> {}

function PageSection({ className, spacing, ...props }: PageSectionProps) {
  return (
    <section
      className={cn(pageSectionVariants({ spacing }), className)}
      data-slot="page-section"
      {...props}
    />
  );
}

function PageSectionHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header className={cn("mb-6 @sm:mb-8", className)} data-slot="page-section-header" {...props} />
  );
}

function PageSectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("font-heading text-2xl @sm:text-3xl", className)}
      data-slot="page-section-title"
      {...props}
    />
  );
}

function PageSectionDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("mt-2 text-muted-foreground", className)}
      data-slot="page-section-description"
      {...props}
    />
  );
}

function PageSectionContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(className)} data-slot="page-section-content" {...props} />;
}

/**
 * PageHeader - A semantic page header for the main content area.
 *
 * Typically contains the page title and optional description.
 * Not to be confused with the site-wide Header component.
 */
function PageHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn("py-6 @sm:py-8 @md:py-12", className)}
      data-slot="page-header"
      {...props}
    />
  );
}

function PageTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn("font-heading text-3xl @sm:text-4xl @md:text-5xl", className)}
      data-slot="page-title"
      {...props}
    />
  );
}

function PageDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("mt-4 max-w-2xl text-lg text-muted-foreground", className)}
      data-slot="page-description"
      {...props}
    />
  );
}

export {
  PageContainer,
  PageContainerDiv,
  pageContainerVariants,
  PageSection,
  pageSectionVariants,
  PageSectionHeader,
  PageSectionTitle,
  PageSectionDescription,
  PageSectionContent,
  PageHeader,
  PageTitle,
  PageDescription,
};
