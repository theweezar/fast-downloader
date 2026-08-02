import { useState } from "react";
import FloatingButton from "./components/FloatingButton";
import Panel from "./components/Panel";
import type { Platform } from "./lib/platform";
import type { UrlStore } from "./lib/url-store";
import type { GlobalState } from "./lib/global-state";
import type { FacebookState } from "./types";

interface AppProps {
  platform: Platform;
  store: UrlStore;
  globalState: GlobalState<FacebookState>;
}

export default function App({
  platform,
  store,
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
          store={store}
          globalState={globalState}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}
