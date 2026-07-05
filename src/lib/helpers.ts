export function safeJsonParse(text: string | null | undefined): any {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export function cleanUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url
    .replace(/\\\//g, "/")
    .replace(/\\u0025/g, "%")
    .replace(/\\u003C/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\\u0026/g, "&");
}

export function cleanResponseText(text: string): string {
  return text.replace(/^for\s*\(;;\);/, "");
}

export function parseFileDataFromURL(url: string): {
  fileName: string;
  extension: string;
} {
  try {
    const u = new URL(url);
    const fileName = u.pathname.split("/").pop() || "";
    const extension = fileName.split(".").pop() || "";
    return { fileName, extension };
  } catch {
    return { fileName: "", extension: "" };
  }
}

export function transformArrayToObject(
  urls: string[]
): Record<string, string> {
  return urls.reduce<Record<string, string>>((acc, url) => {
    try {
      const u = new URL(url);
      const fileName = u.pathname.split("/").pop() || url;
      acc[fileName] = url;
    } catch {
      acc[url] = url;
    }
    return acc;
  }, {});
}

export function firstCandidateUrl(
  candidates: Array<{ url?: string }> | null | undefined
): string | null {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const url = candidates[0]?.url;
  return url ? cleanUrl(url) : null;
}
