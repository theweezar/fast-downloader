import type { Platform } from "../lib/platform";
import type { UrlStore } from "../lib/url-store";
import type { GlobalState } from "../lib/global-state";
import type { FacebookState } from "../types";
import { IoClose } from "react-icons/io5";
import AutoScrollControls from "./AutoScrollControls";
import FacebookPanel from "./FacebookPanel";
import InstagramPanel from "./InstagramPanel";
import TwitterPanel from "./TwitterPanel";
import TikTokPanel from "./TikTokPanel";

interface Props {
  platform: Platform;
  store: UrlStore;
  globalState: GlobalState<FacebookState>;
  onClose: () => void;
}

export default function Panel({
  platform,
  store,
  globalState,
  onClose,
}: Props) {
  return (
    <div className="fixed bottom-20 right-4 w-80 max-h-[70vh] bg-gray-50 rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-[2147483647]">
      <header className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white shrink-0">
        <div>
          <h1 className="text-sm font-semibold leading-tight text-black">
            Fast Downloader
          </h1>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded bg-white text-black transition-colors cursor-pointer"
        >
          <IoClose size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-2">
        <AutoScrollControls platform={platform} />

        {platform === "facebook" && <FacebookPanel store={store} globalState={globalState} />}
        {platform === "instagram" && <InstagramPanel store={store} />}
        {platform === "twitter" && <TwitterPanel store={store} />}
        {platform === "tiktok" && <TikTokPanel store={store} />}
      </div>
    </div>
  );
}
