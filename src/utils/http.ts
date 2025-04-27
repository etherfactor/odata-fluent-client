/**
 * An HTTP method.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const trimSlashRegex = /^\/+|\/+$/;

/**
 * Builds a url from a root and added segments. Strips any segments from the root.
 * @param baseUrl The root url.
 * @param segments The segments to append.
 * @returns The url.
 */
export function buildUrl(baseUrl: string, ...segments: string[]): string {
  const rootUrl = extractBaseUrl(baseUrl);
  return extendUrl(rootUrl, ...segments);
}

/**
 * Extracts the base url from a full url.
 * @param url The full url.
 * @returns The base url.
 */
export function extractBaseUrl(url: string): string {
  const urlObj = new URL(url);
  return urlObj.origin;
}

/**
 * Extends an existing url by appending segments.
 * @param initialUrl The url.
 * @param segments The segments to append.
 * @returns The extended url.
 */
export function extendUrl(initialUrl: string, ...segments: string[]): string {
  //Standardize slashes and remove leading/trailing slashes, since those cause issues
  const pathSegments: string[] = [];
  for (const segment of segments) {
    const trimmedSegment = segment.replace("\\", "/").replace(trimSlashRegex, "");
    pathSegments.push(trimmedSegment);
  }

  //Ensure the base url ends with a slash
  const last = initialUrl[initialUrl.length - 1];
  if (last !== "/" && last !== "\\") {
    initialUrl += "/";
  }

  //Append the segments to the initial url
  const path = segments.join("/");
  return new URL(path, initialUrl).href;
}
