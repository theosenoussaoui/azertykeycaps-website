import type { ArticleCard as ArticleCardType } from "@azertykeycaps-app/schemas";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DitherShader } from "@/components/ui/dither-shader";
import {
  OptimizedImage,
  RESPONSIVE_WIDTHS,
} from "@/components/ui/optimized-image";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_VARIANTS } from "@/features/articles/utils/article-utils";
import { t } from "@/i18n";

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

  // Grid variant: no borders (CardGrid handles them), no shadow
  // Default variant: full border and shadow
  const cardClassName =
    variant === "grid"
      ? "h-full overflow-hidden pt-0 border-0 shadow-none"
      : "h-full overflow-hidden pt-0 transition-shadow hover:shadow-lg";

  return (
    <article className="h-full">
      <Link
        to="/articles/$slug"
        params={{ slug: article.slug }}
        preload={preload}
        className="group block h-full"
      >
        {/* Card with no top padding (pt-0) for flush image, overflow-hidden for effects */}
        <Card className={cardClassName}>
          {/* Article Image - flush with top edge, with hover dithering effect */}
          <figure className="relative aspect-video overflow-hidden">
            {/* Normal image - visible by default, hidden on hover */}
            <OptimizedImage
              src={article.img.url}
              alt={article.img.alt}
              widths={RESPONSIVE_WIDTHS.card}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="absolute inset-0 size-full object-cover transition-opacity duration-300 group-hover:opacity-0 motion-reduce:transition-none"
              width={768}
              height={432}
            />
            {/* Dithered image - hidden by default, visible on hover */}
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none">
              <DitherShader
                src={article.img.url}
                gridSize={1}
                ditherMode="bayer"
                colorMode="grayscale"
                pixelRatio={1}
                threshold={0.4}
                className="size-full"
              />
            </div>
            {/* New Badge - Positioned over image */}
            {article.isNew && (
              <Badge variant="default" className="absolute top-2 right-2 z-20">
                {i18n.common.new}
              </Badge>
            )}
          </figure>

          <CardHeader>
            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
          </CardHeader>

          <CardContent className="flex-1">
            {article.profile && (
              <p className="text-xs text-muted-foreground">
                {article.profile.title}
              </p>
            )}
          </CardContent>

          <CardFooter className="justify-between">
            <Badge variant={STATUS_VARIANTS[article.status]}>
              {i18n.status[article.status]}
            </Badge>
          </CardFooter>
        </Card>
      </Link>
    </article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden pt-0">
      {/* Image skeleton - flush with top */}
      <Skeleton className="aspect-video w-full" />

      <CardHeader>
        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>

      <CardContent className="flex-1">
        {/* Profile skeleton */}
        <Skeleton className="h-3 w-1/2" />
      </CardContent>

      <CardFooter>
        {/* Badge skeleton */}
        <Skeleton className="h-5 w-20" />
      </CardFooter>
    </Card>
  );
}
