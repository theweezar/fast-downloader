import { useState } from "react";
import type { UrlStore } from "../lib/url-store";
import { CATEGORY } from "../lib/url-store";
import { useUrlStore } from "../hooks/useUrlStore";
import {
  isReelPage,
  isStoriesPage,
  normalizeFacebookSource,
  extractFacebookVideoUrls,
  extractFacebookStoryThumbnailUrls,
} from "../lib/facebook-helpers";
import {
  mkEntry
} from "../lib/interceptors/facebook";
import type { GlobalState } from "../lib/global-state";
import type { FacebookState } from "../types";
import { useGlobalState } from "../hooks/useGlobalState";
import { SiFacebook } from "react-icons/si";

interface Props {
  store: UrlStore;
  globalState: GlobalState<FacebookState>;
}

export default function FacebookPanel({ store, globalState }: Props) {
  const images = store.getCategory(CATEGORY.IMAGES);
  const { count } = useUrlStore(store, images);
  const { snapshot } = useGlobalState(globalState);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const showDownloadResource = isReelPage() || isStoriesPage();
  const enableDownloadButton = !!(isReelPage() || (isStoriesPage() && snapshot.facebookStoryUrl));
  const downloadButtonTitle = enableDownloadButton
    ? `Start to download ${isStoriesPage() ? snapshot.facebookStoryUrl : location.href}`
    : 'Disabled';

  const handleDownloadResource = async () => {
    const url = (isStoriesPage() ? snapshot.facebookStoryUrl : location.href) as string;
    setDownloadStatus("Loading...");
    try {
      const response = await fetch(url, {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "cache-control": "max-age=0",
        },
        credentials: "include",
      });
      const html = await response.text();
      const normalized = normalizeFacebookSource(html);
      const videoUrls = extractFacebookVideoUrls(normalized);
      const storyUrls = extractFacebookStoryThumbnailUrls(html);
      const all = [...videoUrls, ...storyUrls];

      console.log("Video:", videoUrls.length);
      console.log("Story thumbnail:", storyUrls.length);

      if (all.length > 0) {
        images.merge(Object.assign(
          {},
          ...all.map((u) => mkEntry(u, snapshot.facebookStoryBucketId || "unknown"))
            .filter((e): e is Record<string, string> => e !== null)
        ));
        images.download("facebook-resource.json");
        images.reset();
        setDownloadStatus("Done!");
      } else {
        setDownloadStatus("Not found");
      }
    } catch {
      setDownloadStatus("Error");
    }
    setTimeout(() => setDownloadStatus(null), 2000);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <SiFacebook className="text-[#1877F2]" size={16} />
      </h3>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-700">
          Download images
          <span className="ml-1 text-xs text-gray-400">({count})</span>
        </span>
        <button
          onClick={() => {
            const name =
              location.pathname.split("/").filter(Boolean).shift() ||
              "facebook";
            images.download(`${name}.json`);
          }}
          disabled={count === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>

      {showDownloadResource && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-700">Download reel / story</span>
          <button
            onClick={handleDownloadResource}
            disabled={!enableDownloadButton}
            title={downloadButtonTitle}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {downloadStatus || "Download"}
          </button>
        </div>
      )}
    </div>
  );
}
