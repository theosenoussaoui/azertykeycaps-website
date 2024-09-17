import ArticleList from "@/components/articles/article-list";
import { TypographyH1 } from "@/components/core/typography/h1";
import { TypographyP } from "@/components/core/typography/p";
import { buttonVariants } from "@/components/ui/button";
import {
  getArticles,
  getProfileSlugs,
  getRandomOgApiImg,
} from "@/lib/api/contentful";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const allProfileSlugs = await getProfileSlugs();

  return allProfileSlugs.map((profile) => ({
    slug: profile,
  }));
}

async function getData(slug: string) {
  const articlesBySlug = await getArticles(slug);
  return { articlesBySlug };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata | undefined> {
  const { articlesBySlug } = await getData(params.slug);
  const randomOgApi = await getRandomOgApiImg();

  if (articlesBySlug.length > 0)
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),
      title: `Azertykeycaps - ${articlesBySlug[0].profile.title ?? ""}`,
      description: articlesBySlug[0].profile.description ?? "",
      openGraph: {
        title: `Azertykeycaps - ${articlesBySlug[0].profile.title ?? ""}`,
        description: articlesBySlug[0].profile.description ?? "",
        locale: "fr_FR",
        type: "website",
        images: [
          {
            url: `/og?imgUrl=${randomOgApi}&title=${
              articlesBySlug[0].profile.title ?? ""
            }`,
            width: 1200,
            height: 630,
            alt: `Azertykeycaps - ${articlesBySlug[0].profile.title ?? ""}`,
          },
        ],
      },
      twitter: {
        title: `Azertykeycaps - ${articlesBySlug[0].profile.title ?? ""}`,
        description:
          "Informations techniques générales concernant le site Azertykeycaps.",
        images: `${
          process.env.NEXT_PUBLIC_URL
        }/og?imgUrl=${randomOgApi}&title=${
          articlesBySlug[0].profile.title ?? ""
        }`,
        card: "summary_large_image",
        creator: "@theosenoussaoui",
        creatorId: "1294263126481874944",
      },
    };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { articlesBySlug } = await getData(params.slug);

  return (
    <>
      {articlesBySlug.length > 0 ? (
        <main className="container my-12">
          <section itemScope itemType="https://schema.org/ProductCollection">
            <meta itemProp="name" content={articlesBySlug[0].profile.title} />

            {articlesBySlug[0].profile.description && (
              <meta
                itemProp="description"
                content={articlesBySlug[0].profile.description}
              />
            )}

            <TypographyH1 itemProp="name">
              {articlesBySlug[0].profile.title}
            </TypographyH1>

            {articlesBySlug[0].profile.description && (
              <TypographyP itemProp="description">
                {articlesBySlug[0].profile.description}
              </TypographyP>
            )}

            <ArticleList articles={articlesBySlug} />
          </section>
        </main>
      ) : (
        <main className="container my-32">
          <div className="space-y-4">
            <TypographyH1>
              <span className="text-primary">Aucun article pour ce profil</span>{" "}
              actuellement.
            </TypographyH1>
            <TypographyP>
              Nous n&apos;avons pas encore de keysets pour ce profil en
              particulier, veuillez réessayer plus tard.
            </TypographyP>
          </div>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "secondary" }), "mt-8")}
          >
            Retour à la maison
          </Link>
        </main>
      )}
    </>
  );
}
