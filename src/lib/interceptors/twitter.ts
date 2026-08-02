import { type UrlStore, CATEGORY } from "../url-store";
import { installXHR } from "../interceptor";
import { safeJsonParse, cleanUrl, parseFileDataFromURL } from "../helpers";

export const twitterConfig = {
  mode: "legacy" as "legacy" | "quoted" | "both",
};

function parseMediaUrl(media: any): string {
  const width = media?.original_info?.width;
  const height = media?.original_info?.height;
  const sizeObj = media?.sizes || {};
  const mediaUrl = new URL(cleanUrl(media?.media_url_https));

  let origSize = "orig";
  for (const [key, size] of Object.entries(sizeObj)) {
    if (
      (size as any)?.w === width &&
      (size as any)?.h === height
    ) {
      origSize = key;
      break;
    }
  }

  mediaUrl.searchParams.set("format", "jpg");
  mediaUrl.searchParams.set("name", origSize);
  return mediaUrl.href;
}

function isPhotoMedia(media: any): boolean {
  return media?.type === "photo" && media?.media_url_https !== undefined;
}

function mapMedia(
  entryId: string,
  mediaArray: any[]
): Record<string, string>[] {
  if (!Array.isArray(mediaArray)) return [];
  return mediaArray.filter(isPhotoMedia).map((media, idx) => {
    const mUrl = parseMediaUrl(media);
    const fileData = parseFileDataFromURL(mUrl);
    const key = `${entryId}-${fileData.fileName || idx}`;
    return { [key]: mUrl };
  });
}

function extractLikedImages(response: any): Record<string, string>[] {
  const entries =
    response?.data?.user?.result?.timeline?.timeline?.instructions?.[0]
      ?.entries;
  if (!Array.isArray(entries)) return [];

  const mode = twitterConfig.mode;

  return entries.flatMap((entry: any) => {
    const entryId = entry?.entryId || "";
    const legacyMedias =
      entry?.content?.itemContent?.tweet_results?.result?.legacy?.entities
        ?.media;
    const quotedMedias =
      entry?.content?.itemContent?.tweet_results?.result
        ?.quoted_status_result?.result?.legacy?.entities?.media;

    if (mode === "legacy") return mapMedia(entryId, legacyMedias);
    if (mode === "quoted") return mapMedia(entryId, quotedMedias);
    return [
      ...mapMedia(entryId, legacyMedias),
      ...mapMedia(entryId, quotedMedias),
    ];
  });
}

function extractUserMediaImages(response: any): Record<string, string>[] {
  let items =
    response?.data?.user?.result?.timeline?.timeline?.instructions?.[2]
      ?.entries?.[0]?.content?.items;
  if (!items) {
    items =
      response?.data?.user?.result?.timeline?.timeline?.instructions?.[0]
        ?.moduleItems;
  }
  if (!Array.isArray(items)) return [];

  return items.flatMap((item: any) => {
    const entryId = item?.entryId || "";
    const mediaArray =
      item?.item?.itemContent?.tweet_results?.result?.legacy?.entities?.media;
    return mapMedia(entryId, mediaArray);
  });
}

export function installTwitterInterceptors(store: UrlStore): () => void {
  const images = store.getCategory(CATEGORY.IMAGES);

  const uninstallXHR = installXHR((xhr) => {
    const isLiked = /api\/graphql\/[^/]*\/Likes/g.test(xhr.responseURL);
    const isUser = /api\/graphql\/[^/]*\/UserMedia/g.test(xhr.responseURL);

    if (!isLiked && !isUser) return;

    const resp = safeJsonParse(xhr.responseText);
    if (!resp) return;

    const urls = isLiked
      ? extractLikedImages(resp)
      : extractUserMediaImages(resp);

    const merged = urls.reduce<Record<string, string>>(
      (acc, curr) => ({ ...acc, ...curr }),
      {}
    );
    images.merge(merged);
  });

  console.log("[FastDL] Twitter interceptors installed.");

  return () => {
    uninstallXHR();
  };
}
