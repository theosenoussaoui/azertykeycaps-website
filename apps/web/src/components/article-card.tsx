import { Link } from "@tanstack/react-router";
import type { Article } from "@azertykeycaps-app/schemas";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/i18n";
import { STATUS_VARIANTS } from "@/lib/article-utils";

interface ArticleCardProps {
  article: Article;
  preload?: "intent" | "viewport" | "render" | false;
}

export function ArticleCard({ article, preload = "intent" }: ArticleCardProps) {
  const i18n = t();

  return (
    <Link to="/articles/$slug" params={{ slug: article.slug }} preload={preload}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <img
          src={article.img.sizes?.card?.url ?? article.img.url}
          srcSet={
            article.img.sizes
              ? `${article.img.sizes.thumbnail?.url ?? article.img.url} 400w, ${article.img.sizes.card?.url ?? article.img.url} 768w`
              : undefined
          }
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={article.img.alt}
          className="aspect-video w-full object-cover"
          loading="lazy"
        />
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
            {article.isNew && (
              <Badge variant="default" className="shrink-0">
                {i18n.common.new}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          {article.profile && (
            <p className="text-muted-foreground text-xs">{article.profile.title}</p>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <Badge variant={STATUS_VARIANTS[article.status]}>{i18n.status[article.status]}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function ArticleCardSkeleton() {
  return (
    <Card className="h-full">
      <div className="bg-muted aspect-video w-full animate-pulse" />
      <CardHeader>
        <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
      </CardHeader>
      <CardContent className="flex-1">
        <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
      </CardContent>
      <CardFooter>
        <div className="bg-muted h-5 w-20 animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}
