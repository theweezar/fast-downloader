import { useState } from "react";
import {
  startAutoScroll,
  stopAutoScroll,
  isAutoScrolling,
} from "../lib/auto-scroll";
import type { Platform } from "../lib/platform";

interface Props {
  platform: Platform;
}

export default function AutoScrollControls({ platform }: Props) {
  const [scrolling, setScrolling] = useState(isAutoScrolling());

  const handleStart = () => {
    const selector =
      platform === "instagram" &&
      location.pathname.includes("your_activity/interactions/likes")
        ? '[data-bloks-name="bk.components.Collection"]'
        : undefined;
    startAutoScroll(selector);
    setScrolling(true);
  };

  const handleStop = () => {
    stopAutoScroll();
    setScrolling(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Auto Scroll
      </h3>
      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={scrolling}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={!scrolling}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Stop
        </button>
      </div>
    </div>
  );
}
