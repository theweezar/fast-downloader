import { useState } from "react";
import FloatingButton from "./components/FloatingButton";
import Panel from "./components/Panel";
import type { Platform } from "./lib/platform";
import type { UrlStore } from "./lib/url-store";
import type { GlobalState } from "./lib/global-state";

interface AppProps {
  platform: Platform;
  imageStore: UrlStore;
  postStore: UrlStore;
  videoStore: UrlStore;
  globalState: GlobalState;
}

export default function App({
  platform,
  imageStore,
  postStore,
  videoStore,
  globalState,
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
          globalState={globalState}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}
