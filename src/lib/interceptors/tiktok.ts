import { UrlStore } from "../url-store";
import { installFetch, type FetchArgsFilter } from "../interceptor";
import { cleanUrl } from "../helpers";

export const tiktokConfig = {
  mode: "images_only" as "images_only" | "videos_only",
};

function extractExtension(urlString: string): string | null {
  try {
    return new URL(urlString).pathname.split(".").pop() || null;
  } catch {
    return null;
  }
}

function extractImageUrl(image: any): string | null {
  const urlList = image?.imageURL?.urlList;
  const p16Url = Array.isArray(urlList)
    ? urlList.find((url: string) => url.includes("p16-sign-sg"))
    : null;
  return p16Url ? cleanUrl(p16Url) : null;
}

function extractItemImages(item: any): string[] {
  const images = item?.imagePost?.images;
  if (!Array.isArray(images)) return [];
  return images.map(extractImageUrl).filter(Boolean) as string[];
}

function urlArrayToObjectByID(
  urls: string[],
  id: string
): Record<string, string> {
  return urls.reduce<Record<string, string>>((acc, url, index) => {
    const ext = extractExtension(url) || "jpeg";
    acc[`${id}_${index}.${ext}`] = url;
    return acc;
  }, {});
}

function processImagePosts(response: any): Record<string, string> {
  const itemList = response?.itemList;
  if (!Array.isArray(itemList)) return {};

  return itemList.reduce<Record<string, string>>((acc, item) => {
    const urls = extractItemImages(item);
    const postId = item?.id;
    if (urls.length > 0 && postId) {
      Object.assign(acc, urlArrayToObjectByID(urls, postId));
    }
    return acc;
  }, {});
}

function processVideoPosts(response: any): Record<string, string> {
  const itemList = response?.itemList;
  if (!Array.isArray(itemList)) return {};

  return itemList.reduce<Record<string, string>>((acc, item) => {
    const videoUrls = item?.video?.PlayAddrStruct?.UrlList;
    const id = item?.id;
    if (!Array.isArray(videoUrls) || !id) return acc;
    const url = videoUrls.find(
      (u: string) =>
        typeof u === "string" && u.includes("v19-webapp-prime")
    );
    if (url) acc[id] = cleanUrl(url);
    return acc;
  }, {});
}

export function installTikTokInterceptors(
  imageStore: UrlStore,
  videoStore: UrlStore
): () => void {
  const argsFilter: FetchArgsFilter = (args) => {
    try {
      const [input, init] = args;
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : (input as Request).url;
      if (url.includes("api/favorite/item_list")) {
        const urlObj = new URL(url);
        urlObj.searchParams.set("count", "35");
        return [urlObj.toString(), init];
      }
    } catch {
      /* ignore filter errors */
    }
    return args;
  };

  const uninstallFetch = installFetch(
    async (response) => {
      if (!response.url.includes("api/favorite/item_list")) return;

      try {
        const data = await response.json();
        if (!data || typeof data !== "object") return;

        if (tiktokConfig.mode === "images_only") {
          const urls = processImagePosts(data);
          imageStore.merge(urls);
          const filtered = {
            ...data,
            itemList: Array.isArray(data.itemList)
              ? data.itemList.filter((item: any) => item?.imagePost)
              : [],
          };
          return new Response(JSON.stringify(filtered), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        }

        if (tiktokConfig.mode === "videos_only") {
          const urls = processVideoPosts(data);
          videoStore.merge(urls);
          const filtered = {
            ...data,
            itemList: Array.isArray(data.itemList)
              ? data.itemList.filter((item: any) => item?.video)
              : [],
          };
          return new Response(JSON.stringify(filtered), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        }
      } catch (e) {
        console.error("[FastDL] TikTok intercept error:", e);
      }
    },
    [argsFilter]
  );

  console.log("[FastDL] TikTok interceptors installed.");

  return () => {
    uninstallFetch();
  };
}
