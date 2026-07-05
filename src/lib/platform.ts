export type Platform = "facebook" | "instagram" | "twitter" | "tiktok";

export function detectPlatform(): Platform | null {
  const host = location.hostname;
  if (host.includes("facebook.com")) return "facebook";
  if (host.includes("instagram.com")) return "instagram";
  if (host.includes("twitter.com") || host === "x.com") return "twitter";
  if (host.includes("tiktok.com")) return "tiktok";
  return null;
}
