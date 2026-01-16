import type { Article } from "@azertykeycaps-app/schemas";

import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/i18n";
import { STATUS_VARIANTS } from "@/lib/article-utils";

interface ArticleCardProps {
  article: Article;
  preload?: "intent" | "viewport" | "render" | false;
}

export function ArticleCard({ article, preload = "intent" }: ArticleCardProps) {
  const i18n = t();

  return (
    <article>
      <Link to="/articles/$slug" params={{ slug: article.slug }} preload={preload}>
        <Card className="h-full transition-shadow hover:shadow-lg">
          {/* Article Image - with explicit dimensions to prevent CLS */}
          <figure className="relative overflow-hidden">
            <img
              src={article.img.sizes?.card?.url ?? article.img.url ?? ""}
              srcSet={
                article.img.sizes
                  ? `${article.img.sizes.thumbnail?.url ?? article.img.url} 400w, ${article.img.sizes.card?.url ?? article.img.url} 768w`
                  : undefined
              }
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt={article.img.alt}
              className="aspect-video w-full object-cover"
              loading="lazy"
              decoding="async"
              width={768}
              height={432}
            />
            {/* New Badge - Positioned over image */}
            {article.isNew && (
              <Badge variant="default" className="absolute right-2 top-2">
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
