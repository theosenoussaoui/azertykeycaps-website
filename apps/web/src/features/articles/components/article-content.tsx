import type { Article } from "@azertykeycaps-app/schemas";
import { Link } from "@tanstack/react-router";
import { AlertTriangleIcon, ExternalLinkIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OptimizedImage,
  RESPONSIVE_WIDTHS,
} from "@/components/ui/optimized-image";
import {
  PageSection,
  PageSectionContent,
} from "@/components/ui/page-container";
import { STATUS_VARIANTS } from "@/features/articles/utils/article-utils";
import { t } from "@/i18n";
import { formatDate } from "@/lib/date-utils";

interface ArticleContentProps {
  article: Article;
}

/**
 * Renders the full article content including hero image, badges, description,
 * action buttons, and dates.
 */
export function ArticleContent({ article }: ArticleContentProps) {
  const i18n = t();

  return (
    <article>
      {/* Hero Image - LCP element with high priority, optimized with Cloudflare Images */}
      <figure className="mb-8">
        <OptimizedImage
          src={article.img.url}
          alt={article.img.alt}
          widths={RESPONSIVE_WIDTHS.hero}
          sizes="100vw"
          className="aspect-video w-full object-cover"
          width={1200}
          height={675}
          priority
        />
      </figure>

      {/* Article Header */}
      <header className="mb-8 space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANTS[article.status]}>
            {i18n.status[article.status]}
          </Badge>
          {article.isNew && <Badge variant="default">{i18n.common.new}</Badge>}
          {article.profile && (
            <Link to="/profile/$slug" params={{ slug: article.profile.slug }}>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
              >
                {article.profile.title}
              </Badge>
            </Link>
          )}
          {article.material && (
            <Badge variant="outline">{i18n.materials[article.material]}</Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl @sm:text-4xl">{article.title}</h1>

        {/* Description */}
        {article.description && (
          <p className="text-lg text-muted-foreground">{article.description}</p>
        )}
      </header>

      {/* Warning */}
      {article.warningText && (
        <PageSection spacing="sm">
          <PageSectionContent>
            <Alert variant="warning">
              <AlertTriangleIcon className="size-4" />
              <AlertDescription>{article.warningText}</AlertDescription>
            </Alert>
          </PageSectionContent>
        </PageSection>
      )}

      {/* Action Buttons */}
      <PageSection spacing="sm">
        <PageSectionContent>
          <div className="flex flex-wrap gap-3">
            <Button
              render={
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {i18n.articles.viewArticle}
              <ExternalLinkIcon />
            </Button>
            {article.affiliateUrl && (
              <Button
                variant="secondary"
                render={
                  <a
                    href={article.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {i18n.articles.affiliateLink}
                <ExternalLinkIcon />
              </Button>
            )}
            {article.additionalUrl && (
              <Button
                variant="outline"
                render={
                  <a
                    href={article.additionalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {i18n.articles.additionalLink}
                <ExternalLinkIcon />
              </Button>
            )}
          </div>
        </PageSectionContent>
      </PageSection>

      {/* Dates */}
      {(article.startDate || article.endDate) && (
        <PageSection spacing="sm">
          <PageSectionContent>
            <dl className="grid gap-2 text-sm @xs:grid-cols-2">
              {article.startDate && (
                <div>
                  <dt className="text-muted-foreground">
                    {i18n.articles.startDate}
                  </dt>
                  <dd>
                    <time dateTime={article.startDate}>
                      {formatDate(article.startDate)}
                    </time>
                  </dd>
                </div>
              )}
              {article.endDate && (
                <div>
                  <dt className="text-muted-foreground">
                    {i18n.articles.endDate}
                  </dt>
                  <dd>
                    <time dateTime={article.endDate}>
                      {formatDate(article.endDate)}
                    </time>
                  </dd>
                </div>
              )}
            </dl>
          </PageSectionContent>
        </PageSection>
      )}
    </article>
  );
}
