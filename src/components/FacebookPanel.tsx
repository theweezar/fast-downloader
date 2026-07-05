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
import { facebookStoryUrl } from "../lib/interceptors/facebook";

interface Props {
  imageStore: UrlStore;
}

export default function FacebookPanel({ imageStore }: Props) {
  const { count, downloadJson } = useUrlStore(imageStore);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const showDownloadResource = isReelPage() || isStoriesPage();

  const handleDownloadResource = async () => {
    const url = facebookStoryUrl || location.href;
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

      if (all.length > 0) {
        for (const u of all) {
          const link = document.createElement("a");
          link.href = u;
          link.download = "";
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
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
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer"
          >
            {downloadStatus || "Download"}
          </button>
        </div>
      )}
    </div>
  );
}
