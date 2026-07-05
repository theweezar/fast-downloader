import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve, dirname, basename } from "path";
import { readFileSync, existsSync } from "fs";

function chromeManifest(): Plugin {
  const srcDir = resolve(__dirname, "src");
  const manifestPath = resolve(srcDir, "manifest.json");

  function collectIconPaths(manifest: any): string[] {
    const paths: string[] = [];
    if (manifest.action?.default_icon) {
      paths.push(manifest.action.default_icon);
    }
    if (manifest.icons) {
      for (const iconPath of Object.values(manifest.icons)) {
        paths.push(iconPath as string);
      }
    }
    return paths;
  }

  return {
    name: "chrome-extension-manifest",
    generateBundle() {
      if (!existsSync(manifestPath)) {
        throw new Error(`Developer manifest not found: ${manifestPath}`);
      }

      const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

      // Validate and copy icon files
      const iconPaths = collectIconPaths(manifest);
      const iconDirMap = new Map<string, string>();

      for (const relPath of iconPaths) {
        const absPath = resolve(srcDir, relPath);
        if (!existsSync(absPath)) {
          throw new Error(`Icon file missing: ${absPath}`);
        }

        const fileName = basename(relPath);
        const distDir = dirname(relPath).replace(/^\.\//, "");
        const distPath = distDir === "." ? fileName : `${distDir}/${fileName}`;

        if (!iconDirMap.has(relPath)) {
          iconDirMap.set(relPath, distPath);
          this.emitFile({
            type: "asset",
            fileName: distPath,
            source: readFileSync(absPath),
          });
        }
      }

      // Rewrite icon paths to dist-relative paths
      if (manifest.action?.default_icon) {
        manifest.action.default_icon = iconDirMap.get(
          manifest.action.default_icon
        );
      }
      if (manifest.icons) {
        for (const [size, relPath] of Object.entries(manifest.icons)) {
          manifest.icons[size] = iconDirMap.get(relPath as string);
        }
      }

      // Auto-inject content script js entry
      if (Array.isArray(manifest.content_scripts)) {
        for (const cs of manifest.content_scripts) {
          cs.js = ["content.js"];
        }
      }

      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: JSON.stringify(manifest, null, 2),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), chromeManifest()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, "src/content.tsx"),
      output: {
        entryFileNames: "content.js",
        format: "iife",
      },
    },
    copyPublicDir: false,
    cssCodeSplit: false,
  },
});
