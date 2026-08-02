import { useState } from "react";
import type { UrlStore } from "../lib/url-store";
import { CATEGORY } from "../lib/url-store";
import { useUrlStore } from "../hooks/useUrlStore";
import { tiktokConfig } from "../lib/interceptors/tiktok";
import { SiTiktok } from "react-icons/si";

interface Props {
  store: UrlStore;
}

export default function TikTokPanel({ store }: Props) {
  const imageCategory = store.getCategory(CATEGORY.IMAGES);
  const videoCategory = store.getCategory(CATEGORY.VIDEOS);
  const images = useUrlStore(store, imageCategory);
  const videos = useUrlStore(store, videoCategory);
  const [mode, setMode] = useState(tiktokConfig.mode);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as typeof tiktokConfig.mode;
    tiktokConfig.mode = next;
    setMode(next);
  };

  const active = mode === "images_only" ? images : videos;

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <SiTiktok className="text-black" size={13} />
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
            ({active.count})
          </span>
        </span>
        <button
          onClick={() =>
            (mode === "images_only" ? imageCategory : videoCategory).download(
              mode === "images_only"
                ? "tiktok-images.json"
                : "tiktok-videos.json"
            )
          }
          disabled={active.count === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  );
}
