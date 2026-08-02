import { type UrlStore, type Category, CATEGORY } from "../url-store";
import { installXHR } from "../interceptor";
import { safeJsonParse, cleanUrl, parseFileDataFromURL } from "../helpers";
import { isPhotosPage } from "../facebook-helpers";
import type { GlobalState } from "../global-state";
import type { FacebookState } from "../../types";

export function mkEntry(uri: string, id: string): Record<string, string> | null {
  if (!uri || !id) return null;
  const fileData = parseFileDataFromURL(uri);
  const key = `${id}-${fileData.fileName}`;
  return { [key]: cleanUrl(uri) };
}

function extractURIs(response: any): Record<string, string> | null {
  const edges = response?.data?.node?.pageItems?.edges;
  if (!Array.isArray(edges)) return null;
  const entries = edges
    .map((el: any) => {
      const uri = el?.node?.node?.viewer_image?.uri;
      const id = el?.node?.node?.id;
      return mkEntry(uri, id);
    })
    .filter((e: Record<string, string> | null): e is Record<string, string> => e !== null);
  return Object.assign({}, ...entries);
}

function extractURIsFromContent(content: string): Record<string, string> {
  const matches = Array.from(
    content
      .trim()
      .matchAll(
        /"__typename":"Photo".*?"id":"(?<id>[^"]+)".*?"uri":"(?<uri>[^"]+)"/g
      )
  );
  const entries = matches
    .map((match) => {
      const uri = match?.groups?.uri?.replace(/\\\//g, "/");
      const id = match?.groups?.id;
      return uri && id ? mkEntry(uri, id) : null;
    })
    .filter((e): e is Record<string, string> => e !== null);
  return Object.assign({}, ...entries) as Record<string, string>;
}

function handleCollectionPage(images: Category): void {
  const scripts = Array.from(
    document.querySelectorAll(
      'script[type="application/json"][data-content-len][data-sjs]'
    )
  );
  for (const script of scripts) {
    const content = script.textContent || "";
    if (
      content.includes("all_collections") &&
      content.includes("pageItems")
    ) {
      const URIs = extractURIsFromContent(content);
      images.merge(URIs);
      break;
    }
  }
}

export function installFacebookInterceptors(
  store: UrlStore,
  globalState: GlobalState<FacebookState>
): () => void {
  const images = store.getCategory(CATEGORY.IMAGES);
  const onDOMReady = () => handleCollectionPage(images);
  document.addEventListener("DOMContentLoaded", onDOMReady);

  const uninstallXHR = installXHR((xhr) => {
    const isGraphql = /api\/graphql/g.test(xhr.responseURL);
    if (!isGraphql) return;

    const resp = safeJsonParse(xhr.responseText);
    if (!resp) return;

    if (
      isPhotosPage() &&
      resp?.data?.node?.__typename === "TimelineAppCollection"
    ) {
      const URIs = extractURIs(resp);
      if (URIs) images.merge(URIs);
    }

    if (resp?.data?.direct_message_thread_update_seen_state) {
      const dmState = resp.data.direct_message_thread_update_seen_state;
      const bucketID = dmState?.bucket?.id;
      const storyID = dmState?.story?.id;
      if (bucketID && storyID) {
        const storyUrl = new URL(
          `stories/${bucketID}/${storyID}`,
          location.origin
        ).href;
        globalState.set("facebookStoryUrl", storyUrl);
        globalState.set("facebookStoryBucketId", bucketID);
        globalState.set("facebookStoryId", storyID);
      }
    }
  });

  console.log("[FastDL] Facebook interceptors installed.");

  return () => {
    document.removeEventListener("DOMContentLoaded", onDOMReady);
    uninstallXHR();
  };
}
