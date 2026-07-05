import { UrlStore } from "../url-store";
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

/**
 * Extract liked post URLs from bloks response.
 * Uses regex-based extraction to find media_code values
 * in Instagram's bloks payload format.
 */
function extractLikedPostUrls(json: any): string[] {
  try {
    const str = JSON.stringify(json);
    const matches = str.match(/"media_code"\s*:\s*"([^"]+)"/g);
    if (!matches) return [];
    return matches
      .map((m) => {
        const code = m.match(/"media_code"\s*:\s*"([^"]+)"/)?.[1];
        return code ? `https://www.instagram.com/p/${code}/` : "";
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function handleLikeResponse(
  response: Response,
  postStore: UrlStore
): Promise<void> {
  try {
    const text = await response.text();
    const json = safeJsonParse(cleanResponseText(text));
    if (!json) return;

    const urls = extractLikedPostUrls(json);
    const obj = Object.entries(transformArrayToObject(urls)).reduce<
      Record<string, string>
    >((acc, [key, value]) => {
      acc[`${key}.html`] = value;
      return acc;
    }, {});
    postStore.merge(obj);
  } catch (e) {
    console.error("[FastDL] Error handling like response:", e);
  }
}

export function installInstagramInterceptors(
  imageStore: UrlStore,
  postStore: UrlStore
): () => void {
  const uninstallXHR = installXHR((xhr) => {
    const resp = safeJsonParse(xhr.responseText);
    if (!resp || typeof resp !== "object") return;

    // Saved posts
    if (
      xhr.responseURL.includes("api/v1/feed/saved/posts") &&
      location.pathname.includes("saved/all-posts")
    ) {
      const urls = extractSavedPostImages(resp);
      imageStore.merge(transformArrayToObject(urls));
    }

    // Profile / timeline posts
    if (
      xhr.responseURL.includes("graphql/query") &&
      !location.pathname.includes("saved/all-posts")
    ) {
      const urls = extractProfileImages(resp);
      imageStore.merge(transformArrayToObject(urls));
    }
  });

  const uninstallFetch = installFetch(async (response) => {
    if (
      response.ok &&
      response.url.includes("async/wbloks/fetch") &&
      location.pathname.includes("your_activity/interactions/likes")
    ) {
      await handleLikeResponse(response, postStore);
    }
  });

  console.log("[FastDL] Instagram interceptors installed.");

  return () => {
    uninstallXHR();
    uninstallFetch();
  };
}
