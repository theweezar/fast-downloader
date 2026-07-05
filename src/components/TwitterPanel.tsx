import { useState } from "react";
import type { UrlStore } from "../lib/url-store";
import { useUrlStore } from "../hooks/useUrlStore";
import { twitterConfig } from "../lib/interceptors/twitter";

interface Props {
  imageStore: UrlStore;
}

export default function TwitterPanel({ imageStore }: Props) {
  const { count, downloadJson } = useUrlStore(imageStore);
  const [mode, setMode] = useState(twitterConfig.mode);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as typeof twitterConfig.mode;
    twitterConfig.mode = next;
    setMode(next);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Twitter / X
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
          onClick={() => downloadJson("twitter.json")}
          disabled={count === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  );
}
