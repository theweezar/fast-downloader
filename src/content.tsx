import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import styles from "./styles.css?inline";
import { detectPlatform } from "./lib/platform";
import { UrlStore } from "./lib/url-store";
import { installFacebookInterceptors } from "./lib/interceptors/facebook";
import { installInstagramInterceptors } from "./lib/interceptors/instagram";
import { installTwitterInterceptors } from "./lib/interceptors/twitter";
import { installTikTokInterceptors } from "./lib/interceptors/tiktok";
import { GlobalState } from "./lib/global-state";
import type { FacebookState } from "./types";

const platform = detectPlatform()!;

if (platform) {
  const store = new UrlStore();
  const globalState = new GlobalState<FacebookState>();

  switch (platform) {
    case "facebook":
      installFacebookInterceptors(store, globalState);
      break;
    case "instagram":
      installInstagramInterceptors(store);
      break;
    case "twitter":
      installTwitterInterceptors(store);
      break;
    case "tiktok":
      installTikTokInterceptors(store);
      break;
  }

  function injectUI() {
    const host = document.createElement("div");
    host.id = "fast-downloader-root";
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = styles;
    shadow.appendChild(style);

    const container = document.createElement("div");
    shadow.appendChild(container);

    createRoot(container).render(
      <React.StrictMode>
        <App
          platform={platform}
          store={store}
          globalState={globalState}
        />
      </React.StrictMode>
    );

    console.log("[FastDL] UI injected into page.");
  }

  if (document.body) {
    injectUI();
  } else {
    document.addEventListener("DOMContentLoaded", injectUI);
  }
}
