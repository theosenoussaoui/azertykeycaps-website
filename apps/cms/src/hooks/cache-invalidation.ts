import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

export interface CacheInvalidationPayload {
  type: "collection" | "global";
  slug: string;
  id?: string;
  articleSlug?: string;
  profileSlug?: string;
  relatedArticleSlugs?: string[];
}

async function getProfileSlug(
  profileField: unknown,
  req: PayloadRequest,
): Promise<string | undefined> {
  if (!profileField) return undefined;

  if (typeof profileField === "object" && profileField !== null && "slug" in profileField) {
    return (profileField as { slug: string }).slug;
  }

  if (typeof profileField === "number" || typeof profileField === "string") {
    try {
      const profile = await req.payload.findByID({
        collection: "keycap-profiles",
        id: profileField,
      });
      return profile?.slug;
    } catch {
      return undefined;
    }
  }

  return undefined;
}

async function getRelatedArticleSlugs(
  profileId: number | string,
  req: PayloadRequest,
): Promise<string[]> {
  try {
    const articles = await req.payload.find({
      collection: "articles",
      where: { profile: { equals: profileId } },
      limit: 500,
      depth: 0,
    });
    return articles.docs.map((a) => a.slug).filter((slug): slug is string => !!slug);
  } catch {
    return [];
  }
}

async function sendInvalidationToServer(payload: CacheInvalidationPayload): Promise<void> {
  const invalidationUrl = process.env.CACHE_INVALIDATION_URL;
  const invalidationSecret = process.env.CACHE_INVALIDATION_SECRET;

  if (!invalidationUrl || !invalidationSecret) {
    console.warn(
      "[cache-invalidation] Missing CACHE_INVALIDATION_URL or CACHE_INVALIDATION_SECRET",
    );
    return;
  }

  try {
    const response = await fetch(invalidationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${invalidationSecret}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[cache-invalidation] Server invalidation failed: ${response.status} - ${errorText}`,
      );
    } else {
      console.log(`[cache-invalidation] Server invalidation sent for ${payload.slug}`);
    }
  } catch (error) {
    console.error("[cache-invalidation] Failed to send invalidation:", error);
  }
}

export const collectionAfterChangeHook: CollectionAfterChangeHook = ({ collection, doc, req }) => {
  const buildAndSendPayload = async () => {
    const payload: CacheInvalidationPayload = {
      type: "collection",
      slug: collection.slug,
      id: doc.id?.toString(),
    };

    if (collection.slug === "articles") {
      payload.articleSlug = doc.slug;
      payload.profileSlug = await getProfileSlug(doc.profile, req);
    }

    if (collection.slug === "keycap-profiles") {
      payload.profileSlug = doc.slug;
      payload.relatedArticleSlugs = await getRelatedArticleSlugs(doc.id, req);
    }

    await sendInvalidationToServer(payload);
  };

  console.log(`[cache-invalidation] Collection ${collection.slug} changed: ${doc.id}`);
  void buildAndSendPayload();

  return doc;
};

export const collectionAfterDeleteHook: CollectionAfterDeleteHook = ({ collection, doc, req }) => {
  const buildAndSendPayload = async () => {
    const payload: CacheInvalidationPayload = {
      type: "collection",
      slug: collection.slug,
      id: doc.id?.toString(),
    };

    if (collection.slug === "articles") {
      payload.articleSlug = doc.slug;
      payload.profileSlug = await getProfileSlug(doc.profile, req);
    }

    if (collection.slug === "keycap-profiles") {
      payload.profileSlug = doc.slug;
    }

    await sendInvalidationToServer(payload);
  };

  console.log(`[cache-invalidation] Collection ${collection.slug} deleted: ${doc.id}`);
  void buildAndSendPayload();

  return doc;
};

export const globalAfterChangeHook: GlobalAfterChangeHook = ({ global, doc }) => {
  const payload: CacheInvalidationPayload = {
    type: "global",
    slug: global.slug,
  };

  console.log(`[cache-invalidation] Global ${global.slug} updated`);
  void sendInvalidationToServer(payload);

  return doc;
};
