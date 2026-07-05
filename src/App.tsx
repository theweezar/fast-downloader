import { useState } from "react";
import FloatingButton from "./components/FloatingButton";
import Panel from "./components/Panel";
import type { Platform } from "./lib/platform";
import type { UrlStore } from "./lib/url-store";

interface AppProps {
  platform: Platform;
  imageStore: UrlStore;
  postStore: UrlStore;
  videoStore: UrlStore;
}

export default function App({
  platform,
  imageStore,
  postStore,
  videoStore,
}: AppProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <FloatingButton
        onClick={() => setExpanded((prev) => !prev)}
        expanded={expanded}
      />
      {expanded && (
        <Panel
          platform={platform}
          imageStore={imageStore}
          postStore={postStore}
          videoStore={videoStore}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}
