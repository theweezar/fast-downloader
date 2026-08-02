import { type UrlStore, type Category, CATEGORY } from "../url-store";
import { installXHR, installFetch } from "../interceptor";
import {
  safeJsonParse,
  transformArrayToObject,
  firstCandidateUrl,
  cleanResponseText,
} from "../helpers";

function recursivePush(collection: string[], media: any): void {
  if (!media) return;
  if (media?.product_type && media?.product_type !== "clips") {
    const first = firstCandidateUrl(media?.image_versions2?.candidates);
    if (first) collection.push(first);
    const carousel = media?.carousel_media;
    if (Array.isArray(carousel)) {
      carousel.forEach((m: any) => recursivePush(collection, m));
    }
  }
}

function extractProfileImages(response: any): string[] {
  const edges =
    response?.data?.xdt_api__v1__feed__user_timeline_graphql_connection?.edges;
  if (!Array.isArray(edges)) return [];
  return edges.flatMap((edge: any) => {
    const urls: string[] = [];
    recursivePush(urls, edge?.node);
    return urls;
  });
}

function extractSavedPostImages(response: any): string[] {
  const items = response?.items;
  if (!Array.isArray(items)) return [];
  return items.flatMap((item: any) => {
    const urls: string[] = [];
    recursivePush(urls, item?.media);
    return urls;
  });
}

function extractLikedPostUrls(json: any): string[] {
  try {
    const str = JSON.stringify(json);

    const regex =
      /\\"media_id\\",\s*\\"media_code\\"[\s\S]*?\(bk\.action\.array\.Make,\s*\\"\d+_\d+\\",\s*\\"([A-Za-z0-9_-]+)\\"/g;

    return Array.from(str.matchAll(regex), ([, code]) =>
      `https://www.instagram.com/p/${code}`
    );
  } catch {
    return [];
  }
}

async function handleLikeResponse(
  response: Response,
  posts: Category
): Promise<void> {
  try {
    const text = await response.text();
    const json = safeJsonParse(cleanResponseText(text));
    if (!json) return;

    const urls = extractLikedPostUrls(json);
    const raw = transformArrayToObject(urls);
    const entries = Object.entries(raw).reduce<
      Record<string, string>
    >((acc, [key, value]) => {
      acc[`${key}.html`] = value;
      return acc;
    }, {});
    posts.merge(entries);
  } catch (e) {
    console.error("[FastDL] Error handling like response:", e);
  }
}

export function installInstagramInterceptors(store: UrlStore): () => void {
  const images = store.getCategory(CATEGORY.IMAGES);
  const posts = store.getCategory(CATEGORY.POSTS);

  const uninstallXHR = installXHR((xhr) => {
    const resp = safeJsonParse(xhr.responseText);
    if (!resp || typeof resp !== "object") return;

    if (
      xhr.responseURL.includes("api/v1/feed/saved/posts") &&
      location.pathname.includes("saved/all-posts")
    ) {
      const urls = extractSavedPostImages(resp);
      images.merge(transformArrayToObject(urls));
    }

    if (
      xhr.responseURL.includes("graphql/query") &&
      !location.pathname.includes("saved/all-posts")
    ) {
      const urls = extractProfileImages(resp);
      images.merge(transformArrayToObject(urls));
    }
  });

  const uninstallFetch = installFetch(async (response) => {
    if (
      response.ok &&
      response.url.includes("async/wbloks/fetch") &&
      location.pathname.includes("your_activity/interactions/likes")
    ) {
      await handleLikeResponse(response, posts);
    }
  });

  console.log("[FastDL] Instagram interceptors installed.");

  return () => {
    uninstallXHR();
    uninstallFetch();
  };
}
