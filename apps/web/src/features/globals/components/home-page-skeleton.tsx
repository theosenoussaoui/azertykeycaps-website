import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardGrid, GridCard } from "@/components/ui/card-grid";
import {
  PageContainer,
  PageDescription,
  PageHeader,
  PageSection,
  PageSectionContent,
  PageSectionHeader,
  PageSectionTitle,
  PageTitle,
} from "@/components/ui/page-container";
import { SectionDivider } from "@/components/ui/section-divider";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCardSkeleton } from "@/features/articles/components/article-card";

export function HomePageSkeleton() {
  return (
    <PageContainer role="status" aria-busy="true">
      <PageHeader>
        <PageTitle className="text-4xl @sm:text-5xl @md:text-6xl @lg:text-7xl">
          <Skeleton className="h-12 w-3/4" />
        </PageTitle>
        <PageDescription>
          <Skeleton className="h-6 w-1/2" />
        </PageDescription>
      </PageHeader>

      <PageSection>
        <PageSectionHeader>
          <PageSectionTitle>
            <Skeleton className="h-8 w-48" />
          </PageSectionTitle>
        </PageSectionHeader>
        <PageSectionContent>
          <SectionDivider />
          <CardGrid as="ul">
            {Array.from({ length: 4 }).map((_, index) => (
              <GridCard
                key={`article-skeleton-${index}`}
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

      <PageSection>
        <PageSectionHeader>
          <PageSectionTitle>
            <Skeleton className="h-8 w-40" />
          </PageSectionTitle>
        </PageSectionHeader>
        <PageSectionContent>
          <SectionDivider />
          <CardGrid as="ul">
            {Array.from({ length: 6 }).map((_, index) => (
              <GridCard
                key={`profile-skeleton-${index}`}
                as="li"
                className="col-span-1 md:col-span-2"
              >
                <Card className="h-full border-0 bg-transparent shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </CardTitle>
                    <CardDescription>
                      <Skeleton className="h-4 w-full" />
                    </CardDescription>
                  </CardHeader>
                </Card>
              </GridCard>
            ))}
          </CardGrid>
          <SectionDivider />
        </PageSectionContent>
      </PageSection>
    </PageContainer>
  );
}
