import { useState } from "react";
import type { UrlStore } from "../lib/url-store";
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
import { useGlobalState } from "../hooks/useGlobalState";

interface Props {
  imageStore: UrlStore;
  globalState: GlobalState;
}

export default function FacebookPanel({ imageStore, globalState }: Props) {
  const { count, downloadJson, mergeUrls, reset } = useUrlStore(imageStore);
  const { snapshot } = useGlobalState(globalState);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const showDownloadResource = isReelPage() || isStoriesPage();
  const enableDownloadButton = !!(isReelPage() || (isStoriesPage() && snapshot.facebookStoryUrl));
  const downloadButtonTitle = enableDownloadButton
    ? `Start to download ${isStoriesPage() ? snapshot.facebookStoryUrl : location.href}`
    : 'Disabled';

  const handleDownloadResource = async () => {
    const url = isStoriesPage() ? snapshot.facebookStoryUrl : location.href;
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
        mergeUrls(Object.assign(
          {},
          ...all.map((u) => mkEntry(u, snapshot.facebookStoryBucketId || "unknown"))
            .filter((e): e is Record<string, string> => e !== null)
        ));
        downloadJson("facebook-resource.json");
        reset();
        setDownloadStatus("Done!");
      } else {
        setDownloadStatus("Not found");
      }
    } catch {
      setDownloadStatus("Error");
    }
    setTimeout(() => setDownloadStatus(null), 2000);
  };

  console.log("Rendering...");

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Facebook
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
            downloadJson(`${name}.json`);
          }}
          disabled={count === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
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
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {downloadStatus || "Download"}
          </button>
        </div>
      )}
    </div>
  );
}
