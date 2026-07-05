import { useState } from "react";
import type { UrlStore } from "../lib/url-store";
import { useUrlStore } from "../hooks/useUrlStore";
import { tiktokConfig } from "../lib/interceptors/tiktok";

interface Props {
  imageStore: UrlStore;
  videoStore: UrlStore;
}

export default function TikTokPanel({ imageStore, videoStore }: Props) {
  const images = useUrlStore(imageStore);
  const videos = useUrlStore(videoStore);
  const [mode, setMode] = useState(tiktokConfig.mode);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as typeof tiktokConfig.mode;
    tiktokConfig.mode = next;
    setMode(next);
  };

  const activeStore = mode === "images_only" ? images : videos;

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        TikTok
      </h3>

      <div className="flex items-center justify-between gap-2">
        <label className="text-sm text-gray-700" htmlFor="fd-tiktok-mode">
          Intercept mode
        </label>
        <select
          id="fd-tiktok-mode"
          value={mode}
          onChange={handleModeChange}
          className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          <option value="images_only">Images only</option>
          <option value="videos_only">Videos only</option>
        </select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-700">
          {mode === "images_only" ? "Images" : "Videos"}
          <span className="ml-1 text-xs text-gray-400">
            ({activeStore.count})
          </span>
        </span>
        <button
          onClick={() =>
            activeStore.downloadJson(
              mode === "images_only"
                ? "tiktok-images.json"
                : "tiktok-videos.json"
            )
          }
          disabled={activeStore.count === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  );
}
