import { CardGrid, GridCard } from "@/components/ui/card-grid";
import {
  PageContainer,
  PageDescription,
  PageHeader,
  PageSection,
  PageSectionContent,
  PageTitle,
} from "@/components/ui/page-container";
import { SectionDivider } from "@/components/ui/section-divider";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCardSkeleton } from "@/features/articles/components/article-card";

export function ProfilePageSkeleton() {
  return (
    <PageContainer role="status" aria-busy="true">
      {/* Back Navigation */}
      <nav className="py-4">
        <Skeleton className="h-8 w-20" />
      </nav>

      {/* Page Header */}
      <PageHeader className="py-4">
        <div className="flex flex-wrap items-center gap-3">
          <PageTitle>
            <Skeleton className="h-9 w-48" />
          </PageTitle>
          <Skeleton className="h-5 w-16" />
        </div>
        <PageDescription>
          <Skeleton className="h-5 w-32" />
        </PageDescription>
      </PageHeader>

      {/* Filters */}
      <PageSection spacing="sm">
        <PageSectionContent>
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </PageSectionContent>
      </PageSection>

      {/* Articles Grid */}
      <PageSection>
        <PageSectionContent>
          <SectionDivider />
          <CardGrid as="ul">
            {Array.from({ length: 4 }).map((_, index) => (
              <GridCard
                key={`profile-article-skeleton-${index}`}
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

      {/* Pagination */}
      <PageSection spacing="sm">
        <PageSectionContent>
          <Skeleton className="mx-auto h-10 w-64" />
        </PageSectionContent>
      </PageSection>
    </PageContainer>
  );
}
