import contentful, { Asset, Entry } from "contentful";
import type { Document } from "@contentful/rich-text-types";
export interface TopWarningContentfulInterface {
  richWarning: Document;
}

export interface TopWarningInterface {}

export interface ProfileContentfulInterface {
  readonly title: string;
  readonly slug: string;
}

export interface KeycapArticleContentfulInterface {
  readonly img: Asset;
  readonly title: string;
  readonly profile: Entry<ProfileContentfulInterface>;
  readonly description?: string;
  readonly material: string;
  readonly status?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly url: string;
  readonly warning?: string;
  readonly isNew?: boolean;
}

export type KeycapArticleType = Omit<
  KeycapArticleContentfulInterface,
  "img" | "profile" | "startDate" | "endDate"
> & {
  img: string;
  profile: string;
  profileId: string;
  startDate?: string;
  endDate?: string;
};

export const contentfulClient = contentful.createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.DEV
    ? import.meta.env.CONTENTFUL_PREVIEW_TOKEN
    : import.meta.env.CONTENTFUL_DELIVERY_TOKEN,
  host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
});
