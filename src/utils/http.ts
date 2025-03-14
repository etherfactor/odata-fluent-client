export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const trimSlashRegex = /^\/+|\/+$/;

export function buildUrl(baseUrl: string, ...segments: string[]): string {
  const rootUrl = extractBaseUrl(baseUrl);
  return extendUrl(rootUrl, ...segments);
}

export function extractBaseUrl(url: string): string {
  const urlObj = new URL(url);
  return urlObj.origin;
}

export function extendUrl(initialUrl: string, ...segments: string[]): string {
  const pathSegments: string[] = [];
  for (const segment of segments) {
    const trimmedSegment = segment.replace("\\", "/").replace(trimSlashRegex, "");
    pathSegments.push(trimmedSegment);
  }

  const last = initialUrl[initialUrl.length - 1];
  if (last !== "/" && last !== "\\") {
    initialUrl += "/";
  }

  const path = segments.join("/");
  return new URL(path, initialUrl).href;
}
