import type { UrlStore } from "../lib/url-store";
import { useUrlStore } from "../hooks/useUrlStore";

interface Props {
  imageStore: UrlStore;
  postStore: UrlStore;
}

export default function InstagramPanel({ imageStore, postStore }: Props) {
  const images = useUrlStore(imageStore);
  const posts = useUrlStore(postStore);

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Instagram
      </h3>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-700">
          Saved / profile images
          <span className="ml-1 text-xs text-gray-400">
            ({images.count})
          </span>
        </span>
        <button
          onClick={() => images.downloadJson("instagram-profile.json")}
          disabled={images.count === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-300 disabled:bg-none text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-700">
          Liked post URLs
          <span className="ml-1 text-xs text-gray-400">({posts.count})</span>
        </span>
        <button
          onClick={() => posts.downloadJson("instagram-liked-posts.json")}
          disabled={posts.count === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-300 disabled:bg-none text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  );
}
