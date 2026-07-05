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

const platform = detectPlatform()!;

if (platform) {
  // Create stores as React-external state
  const imageStore = new UrlStore();
  const postStore = new UrlStore();
  const videoStore = new UrlStore();

  // Install interceptors immediately (before DOM is ready)
  // so we capture network requests from the very start
  switch (platform) {
    case "facebook":
      installFacebookInterceptors(imageStore);
      break;
    case "instagram":
      installInstagramInterceptors(imageStore, postStore);
      break;
    case "twitter":
      installTwitterInterceptors(imageStore);
      break;
    case "tiktok":
      installTikTokInterceptors(imageStore, videoStore);
      break;
  }

  // Inject React UI when DOM is ready
  function injectUI() {
    const host = document.createElement("div");
    host.id = "fast-downloader-root";
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    // Inject Tailwind CSS into shadow DOM for style isolation
    const style = document.createElement("style");
    style.textContent = styles;
    shadow.appendChild(style);

    const container = document.createElement("div");
    shadow.appendChild(container);

    createRoot(container).render(
      <React.StrictMode>
        <App
          platform={platform}
          imageStore={imageStore}
          postStore={postStore}
          videoStore={videoStore}
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
