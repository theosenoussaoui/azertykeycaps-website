import type { ArticleCard as ArticleCardType } from "@azertykeycaps-app/schemas";
import { Link } from "@tanstack/react-router";
import { ChevronDownIcon, ExternalLinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  OptimizedImage,
  RESPONSIVE_WIDTHS,
} from "@/components/ui/optimized-image";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_VARIANTS } from "@/features/articles/utils/article-utils";
import { t } from "@/i18n";
import { formatDate } from "@/lib/date-utils";

interface ArticleCardProps {
  article: ArticleCardType;
  preload?: "intent" | "viewport" | "render" | false;
  /** Variant for grid layout - "grid" removes borders since CardGrid handles them */
  variant?: "default" | "grid";
}

export function ArticleCard({
  article,
  preload = "intent",
  variant = "default",
}: ArticleCardProps) {
  const i18n = t();

  // Grid variant: no borders (CardGrid handles them), no shadow, transparent bg for GridCard hover
  // Default variant: full border and shadow
  const cardClassName =
    variant === "grid"
      ? "h-full overflow-hidden pt-0 border-0 bg-transparent shadow-none"
      : "h-full overflow-hidden pt-0 transition-shadow hover:shadow-lg";

  // Check if there are indications to show
  const hasIndications = !!article.warningText;

  return (
    <article className="h-full">
      <Link
        to="/articles/$slug"
        params={{ slug: article.slug }}
        preload={preload}
        className="group block h-full"
      >
        <Card className={`${cardClassName} gap-0`}>
          {/* Image with "Nouveau" badge */}
          <figure className="relative aspect-video overflow-hidden">
            <OptimizedImage
              src={article.img.url}
              alt={article.img.alt}
              widths={RESPONSIVE_WIDTHS.card}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="size-full object-cover grayscale-0 transition-[filter] duration-200 group-hover:grayscale motion-reduce:transition-none"
              width={768}
              height={432}
            />
            {article.isNew && (
              <Badge variant="default" className="absolute top-2 right-2 z-20">
                {i18n.common.new}
              </Badge>
            )}
          </figure>

          {/* Title */}
          <CardHeader className="py-4">
            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
          </CardHeader>

          <Separator className="opacity-60" />

          {/* Metadata: Profile + Material */}
          <CardContent className="py-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">
                {i18n.articles.profile} :
              </dt>
              <dd>{article.profile?.title ?? "—"}</dd>

              <dt className="text-muted-foreground">
                {i18n.articles.material} :
              </dt>
              <dd>
                {article.material ? i18n.materials[article.material] : "—"}
              </dd>
            </dl>
          </CardContent>

          <Separator className="opacity-60" />

          {/* Status */}
          <CardContent className="py-4">
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 text-sm">
              <dt className="text-muted-foreground">
                {i18n.articles.statusLabel} :
              </dt>
              <dd>
                <Badge variant={STATUS_VARIANTS[article.status]} size="sm">
                  {i18n.status[article.status]}
                </Badge>
              </dd>
            </dl>
          </CardContent>

          <Separator className="opacity-60" />

          {/* Dates */}
          <CardContent className="py-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">
                {i18n.articles.startDate} :
              </dt>
              <dd className="tabular-nums">
                {formatDate(article.startDate) ?? i18n.articles.noDate}
              </dd>

              <dt className="text-muted-foreground">
                {i18n.articles.endDate} :
              </dt>
              <dd className="tabular-nums">
                {formatDate(article.endDate) ?? i18n.articles.noDate}
              </dd>
            </dl>
          </CardContent>

          <Separator className="opacity-60" />

          {/* Indications */}
          <CardContent className="py-4">
            {hasIndications ? (
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger
                  className="flex w-full items-center justify-between text-sm hover:text-foreground"
                  onClick={(e) => e.preventDefault()}
                >
                  <span>{i18n.articles.indications}</span>
                  <ChevronDownIcon className="size-4 transition-transform duration-200 [[data-panel-open]_&]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsiblePanel>
                  <p className="pt-3 text-sm text-muted-foreground">
                    {article.warningText}
                  </p>
                </CollapsiblePanel>
              </Collapsible>
            ) : (
              <p className="text-sm text-muted-foreground">
                {i18n.articles.noIndications}
              </p>
            )}
          </CardContent>

          {/* Action Buttons */}
          <CardFooter className="flex-wrap gap-2 pt-4">
            {article.additionalUrl ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <a
                      href={article.additionalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                >
                  {i18n.articles.secondaryKit}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  render={
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                >
                  {i18n.articles.viewSet}
                  <ExternalLinkIcon className="size-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="w-full"
                render={
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              >
                {i18n.articles.viewSet}
                <ExternalLinkIcon className="size-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </Link>
    </article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <Card className="h-full gap-0 overflow-hidden pt-0">
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full" />

      {/* Title skeleton */}
      <CardHeader className="py-4">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>

      <Separator className="opacity-60" />

      {/* Profile + Material skeleton */}
      <CardContent className="py-4">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>

      <Separator className="opacity-60" />

      {/* Status skeleton */}
      <CardContent className="py-4">
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>

      <Separator className="opacity-60" />

      {/* Dates skeleton */}
      <CardContent className="py-4">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>

      <Separator className="opacity-60" />

      {/* Indications skeleton */}
      <CardContent className="py-4">
        <Skeleton className="h-4 w-full" />
      </CardContent>

      {/* Button skeletons */}
      <CardFooter className="gap-2 pt-4">
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}
