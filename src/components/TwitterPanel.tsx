import { useState } from "react";
import type { UrlStore } from "../lib/url-store";
import { CATEGORY } from "../lib/url-store";
import { useUrlStore } from "../hooks/useUrlStore";
import { twitterConfig } from "../lib/interceptors/twitter";
import { SiX } from "react-icons/si";

interface Props {
  store: UrlStore;
}

export default function TwitterPanel({ store }: Props) {
  const imageCategory = store.getCategory(CATEGORY.IMAGES);
  const { count } = useUrlStore(store, imageCategory);
  const [mode, setMode] = useState(twitterConfig.mode);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as typeof twitterConfig.mode;
    twitterConfig.mode = next;
    setMode(next);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <SiX className="text-black" size={12} />
      </h3>

      <div className="flex items-center justify-between gap-2">
        <label className="text-sm text-gray-700" htmlFor="fd-twitter-mode">
          Download mode
        </label>
        <select
          id="fd-twitter-mode"
          value={mode}
          onChange={handleModeChange}
          className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="both">Both</option>
          <option value="legacy">Legacy</option>
          <option value="quoted">Quoted</option>
        </select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-700">
          Download entries
          <span className="ml-1 text-xs text-gray-400">({count})</span>
        </span>
        <button
          onClick={() => imageCategory.download("twitter.json")}
          disabled={count === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  );
}
