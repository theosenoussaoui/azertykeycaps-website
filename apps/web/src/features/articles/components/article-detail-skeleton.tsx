import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CardGrid, GridCard } from "@/components/ui/card-grid";
import {
  PageContainer,
  PageSection,
  PageSectionContent,
  PageSectionHeader,
  PageSectionTitle,
} from "@/components/ui/page-container";
import { SectionDivider } from "@/components/ui/section-divider";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCardSkeleton } from "@/features/articles/components/article-card";

export function ArticleDetailSkeleton() {
  return (
    <PageContainer role="status" aria-busy="true">
      {/* Breadcrumb Navigation */}
      <nav className="py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Skeleton className="h-4 w-16" />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Skeleton className="h-4 w-20" />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Skeleton className="h-4 w-32" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      {/* Article Content */}
      <article>
        {/* Hero Image */}
        <figure className="mb-8">
          <Skeleton className="aspect-video w-full" />
        </figure>

        {/* Article Header */}
        <header className="mb-8 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-18" />
          </div>

          {/* Title */}
          <Skeleton className="h-10 w-3/4" />

          {/* Description */}
          <Skeleton className="h-6 w-full" />
        </header>

        {/* Action Buttons */}
        <PageSection spacing="sm">
          <PageSectionContent>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-28" />
            </div>
          </PageSectionContent>
        </PageSection>

        {/* Dates */}
        <PageSection spacing="sm">
          <PageSectionContent>
            <dl className="grid gap-2 text-sm @xs:grid-cols-2">
              <div>
                <Skeleton className="mb-1 h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="mb-1 h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </dl>
          </PageSectionContent>
        </PageSection>
      </article>

      {/* Related Articles Section */}
      <PageSection>
        <PageSectionHeader>
          <PageSectionTitle>
            <Skeleton className="h-8 w-40" />
          </PageSectionTitle>
        </PageSectionHeader>
        <PageSectionContent>
          <SectionDivider />
          <CardGrid as="ul">
            {Array.from({ length: 4 }).map((_, index) => (
              <GridCard
                key={`related-article-skeleton-${index}`}
                as="li"
                className="col-span-2 md:col-span-2"
              >
                <ArticleCardSkeleton />
              </GridCard>
            ))}
          </CardGrid>
          <SectionDivider />
        </PageSectionContent>
      </PageSection>
    </PageContainer>
  );
}
