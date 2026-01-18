import { Link, useRouter } from "@tanstack/react-router";
import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react";

import { t } from "@/i18n";

import { Button } from "../ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import {
  PageContainer,
  PageSection,
  PageSectionContent,
} from "../ui/page-container";

export interface PageErrorProps {
  /**
   * Show back navigation button
   * @default false
   */
  showBackButton?: boolean;
  /**
   * Custom back button destination
   * @default "/"
   */
  backTo?: string;
  /**
   * Custom error title (uses i18n.errors.generic by default)
   */
  title?: string;
  /**
   * Custom error description (uses i18n.errors.loadingFailed by default)
   */
  description?: string;
  /**
   * Custom icon component
   */
  icon?: React.ReactNode;
}

/**
 * Reusable error component for route errorComponent prop.
 *
 * @example
 * // Basic usage
 * errorComponent: PageError
 *
 * @example
 * // With back button
 * errorComponent: () => <PageError showBackButton />
 *
 * @example
 * // With custom props
 * errorComponent: () => (
 *   <PageError
 *     showBackButton
 *     backTo="/articles"
 *     title="Article not found"
 *   />
 * )
 */
export function PageError({
  showBackButton = false,
  backTo = "/",
  title,
  description,
  icon,
}: PageErrorProps) {
  const router = useRouter();
  const i18n = t();

  return (
    <PageContainer size="md">
      {showBackButton && (
        <nav className="py-4">
          <Button variant="ghost" size="sm" render={<Link to={backTo} />}>
            <ArrowLeftIcon />
            {i18n.common.back}
          </Button>
        </nav>
      )}
      <PageSection>
        <PageSectionContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {icon ?? <AlertCircleIcon />}
              </EmptyMedia>
              <EmptyTitle>{title ?? i18n.errors.generic}</EmptyTitle>
              <EmptyDescription>
                {description ?? i18n.errors.loadingFailed}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => router.invalidate()}>
                {i18n.common.retry}
              </Button>
            </EmptyContent>
          </Empty>
        </PageSectionContent>
      </PageSection>
    </PageContainer>
  );
}

/**
 * PageError with back button pre-configured.
 * Useful for detail pages (articles, profiles).
 */
export function PageErrorWithBack(
  props: Omit<PageErrorProps, "showBackButton">,
) {
  return <PageError showBackButton {...props} />;
}
