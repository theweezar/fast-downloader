import { safeJsonParse } from "./helpers";

export function normalizeFacebookSource(
  html: string | null | undefined
): string {
  if (!html) return "";
  return html
    .replace(/\\"/g, '"')
    .replace(/\\\//g, "/")
    .replace(/\\u0025/g, "%")
    .replace(/\\u003C/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\\u0026/g, "&");
}

export function extractFacebookVideoUrls(htmlContent: string) {
  if (typeof htmlContent !== "string") return [];

  const urls = new Set<string>();

  // Match DASH manifest BaseURL entries
  const manifestRegex = /FBQualityLabel="720p"[^>]*>\s*<BaseURL>([^<]+)<\/BaseURL>/g;
  for (const match of htmlContent.matchAll(manifestRegex)) {
    urls.add(match[1].trim());
  }

  return [...urls];
}

function recursivePushStoryThumbnailUrls(
  value: any,
  collection: string[]
): void {
  if (value && typeof value === "object") {
    if (value.story_thumbnail?.uri) {
      collection.push(value.story_thumbnail.uri);
    }
    for (const v of Object.values(value)) {
      if (v && typeof v === "object") {
        recursivePushStoryThumbnailUrls(v, collection);
      }
    }
  }
}

export function extractFacebookStoryThumbnailUrls(html: string): string[] {
  const collection: string[] = [];
  const scriptRegex =
    /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
  const scripts = html.match(scriptRegex) || [];
  for (const script of scripts) {
    const content = script.replace(/<\/?script[^>]*>/gi, "");
    const json = safeJsonParse(content);
    if (json) recursivePushStoryThumbnailUrls(json, collection);
  }
  return collection;
}

export function isReelPage(href?: string): boolean {
  return (href || location.href).includes("/reel");
}

export function isStoriesPage(href?: string): boolean {
  const url = href || location.href;
  return url.includes("/stories") || url.includes("/story.php");
}

export function isPhotosPage(href?: string): boolean {
  return (href || location.href).includes("/photos");
}

export function isDirectMessageThreadBucketGraphql(
  responseText: string
): boolean {
  return responseText.includes("unified_stories_with_notes");
}

export function extractJSONFromGraphql(responseText: string): any {
  const json = safeJsonParse(responseText);
  if (json) return json;
  const firstLine = responseText.split("\n")[0];
  return safeJsonParse(firstLine);
}
