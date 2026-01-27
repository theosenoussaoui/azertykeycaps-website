import type { ArticleCard as ArticleCardType } from "@azertykeycaps-app/schemas";
import { Link } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

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
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { STATUS_VARIANTS } from "@/features/articles/utils/article-utils";
import { t } from "@/i18n";

interface ArticleCardProps {
  article: ArticleCardType;
  preload?: "intent" | "viewport" | "render" | false;
  /** Variant for grid layout - "grid" removes borders since CardGrid handles them */
  variant?: "default" | "grid";
}

function DateDisplay({
  date,
}: {
  date: string | null | undefined;
  label: string;
}) {
  const i18n = t();
  return <>{date ?? i18n.articles.noDate}</>;
}

export function ArticleCard({
  article,
  preload = "intent",
  variant = "default",
}: ArticleCardProps) {
  const i18n = t();
  const [isIndicationsOpen, setIsIndicationsOpen] = useState(false);

  // Grid variant: no borders (CardGrid handles them), no shadow, transparent bg for GridCard hover
  // Default variant: full border and shadow
  const cardClassName =
    variant === "grid"
      ? "h-full overflow-hidden pt-0 border-0 bg-transparent shadow-none"
      : "h-full overflow-hidden pt-0 transition-shadow hover:shadow-lg";

  // Check if there are indications to show
  const hasIndications = !!article.warningText;

  return (
    <article className="group h-full">
      <Card className={`${cardClassName} gap-0`}>
        <Link
          to="/articles/$slug"
          params={{ slug: article.slug }}
          preload={preload}
          className="block"
        >
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
        </Link>

        <CardHeader className="flex! h-14! items-center! py-0!">
          <CardTitle className="w-full font-bold">
            <Tooltip>
              <TooltipTrigger className="block w-full text-left">
                <Link
                  to="/articles/$slug"
                  params={{ slug: article.slug }}
                  preload={preload}
                  className="line-clamp-1 leading-tight hover:underline"
                >
                  {article.title}
                </Link>
              </TooltipTrigger>
              <TooltipPopup>{article.title}</TooltipPopup>
            </Tooltip>
          </CardTitle>
        </CardHeader>

        <Separator className="opacity-60" />

        {/* Metadata: Profile + Material */}
        <CardContent className="py-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">{i18n.articles.profile} :</dt>
            <dd>{article.profile?.title ?? "—"}</dd>

            <dt className="text-muted-foreground">
              {i18n.articles.material} :
            </dt>
            <dd>{article.material ? i18n.materials[article.material] : "—"}</dd>
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
              <DateDisplay date={article.startDate} label="Start" />
            </dd>

            <dt className="text-muted-foreground">{i18n.articles.endDate} :</dt>
            <dd className="tabular-nums">
              <DateDisplay date={article.endDate} label="End" />
            </dd>
          </dl>
        </CardContent>

        <Separator className="opacity-60" />

        {/* Indications */}
        <CardContent className="py-4">
          {hasIndications ? (
            <Collapsible
              open={isIndicationsOpen}
              onOpenChange={setIsIndicationsOpen}
            >
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

        <Separator className="opacity-60" />

        {/* Action Buttons */}
        <CardFooter className="flex-wrap gap-2 pt-4">
          {article.additionalUrl ? (
            <>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 font-mono font-semibold tracking-tight uppercase"
                render={
                  <a
                    href={article.additionalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {i18n.articles.secondaryKit}
              </Button>
              <Button
                variant="default"
                size="lg"
                className="flex-1 font-mono font-semibold tracking-tight uppercase"
                render={
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {i18n.articles.viewSet}
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="lg"
              className="w-full font-mono font-semibold tracking-tight uppercase"
              render={
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {i18n.articles.viewSet}
            </Button>
          )}
        </CardFooter>
      </Card>
    </article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <Card className="h-full gap-0 overflow-hidden pt-0">
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full" />

      {/* Title skeleton */}
      <CardHeader className="py-3">
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
