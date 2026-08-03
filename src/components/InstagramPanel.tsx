import type { UrlStore } from "../lib/url-store";
import { CATEGORY } from "../lib/url-store";
import { useUrlStore } from "../hooks/useUrlStore";
import { SiInstagram } from "react-icons/si";

interface Props {
  store: UrlStore;
}

export default function InstagramPanel({ store }: Props) {
  const imageCategory = store.getCategory(CATEGORY.IMAGES);
  const postCategory = store.getCategory(CATEGORY.POSTS);
  const images = useUrlStore(store, imageCategory);
  const posts = useUrlStore(store, postCategory);

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <SiInstagram className="text-[#E4405F]" size={16} />
      </h3>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-700">
          Saved / profile images
          <span className="ml-1 text-xs text-gray-400">
            ({images.count})
          </span>
        </span>
        <button
          onClick={() => imageCategory.download("instagram-profile.json")}
          disabled={images.count === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
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
          onClick={() => postCategory.download("instagram-liked-posts.json")}
          disabled={posts.count === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  );
}
