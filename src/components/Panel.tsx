import type { Platform } from "../lib/platform";
import type { UrlStore } from "../lib/url-store";
import AutoScrollControls from "./AutoScrollControls";
import FacebookPanel from "./FacebookPanel";
import InstagramPanel from "./InstagramPanel";
import TwitterPanel from "./TwitterPanel";
import TikTokPanel from "./TikTokPanel";

const platformLabels: Record<Platform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "Twitter / X",
  tiktok: "TikTok",
};

interface Props {
  platform: Platform;
  imageStore: UrlStore;
  postStore: UrlStore;
  videoStore: UrlStore;
  onClose: () => void;
}

export default function Panel({
  platform,
  imageStore,
  postStore,
  videoStore,
  onClose,
}: Props) {
  return (
    <div className="fixed bottom-20 right-4 w-80 max-h-[70vh] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-[2147483647]">
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white shrink-0">
        <div>
          <h1 className="text-sm font-semibold leading-tight">
            Fast Downloader
          </h1>
          <p className="text-[11px] text-blue-200">
            {platformLabels[platform]}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 transition-colors cursor-pointer text-sm"
        >
          ✕
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AutoScrollControls platform={platform} />

        {platform === "facebook" && <FacebookPanel imageStore={imageStore} />}
        {platform === "instagram" && (
          <InstagramPanel imageStore={imageStore} postStore={postStore} />
        )}
        {platform === "twitter" && <TwitterPanel imageStore={imageStore} />}
        {platform === "tiktok" && (
          <TikTokPanel imageStore={imageStore} videoStore={videoStore} />
        )}
      </div>
    </div>
  );
}
