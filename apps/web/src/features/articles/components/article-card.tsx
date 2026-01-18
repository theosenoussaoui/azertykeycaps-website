import type { ArticleCard as ArticleCardType } from "@azertykeycaps-app/schemas";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage, RESPONSIVE_WIDTHS } from "@/components/ui/optimized-image";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_VARIANTS } from "@/features/articles/utils/article-utils";
import { t } from "@/i18n";

interface ArticleCardProps {
  article: ArticleCardType;
  preload?: "intent" | "viewport" | "render" | false;
}

export function ArticleCard({ article, preload = "intent" }: ArticleCardProps) {
  const i18n = t();

  return (
    <article>
      <Link to="/articles/$slug" params={{ slug: article.slug }} preload={preload}>
        <Card className="h-full transition-shadow hover:shadow-lg">
          {/* Article Image - optimized with Cloudflare Images */}
          <figure className="relative overflow-hidden">
            <OptimizedImage
              src={article.img.url}
              alt={article.img.alt}
              widths={RESPONSIVE_WIDTHS.card}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="aspect-video w-full object-cover"
              width={768}
              height={432}
            />
            {/* New Badge - Positioned over image */}
            {article.isNew && (
              <Badge variant="default" className="absolute top-2 right-2">
                {i18n.common.new}
              </Badge>
            )}
          </figure>

          <CardHeader>
            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
          </CardHeader>

          <CardContent className="flex-1">
            {article.profile && (
              <p className="text-xs text-muted-foreground">{article.profile.title}</p>
            )}
          </CardContent>

          <CardFooter className="justify-between">
            <Badge variant={STATUS_VARIANTS[article.status]}>{i18n.status[article.status]}</Badge>
          </CardFooter>
        </Card>
      </Link>
    </article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <Card className="h-full">
      {/* Image skeleton */}
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
