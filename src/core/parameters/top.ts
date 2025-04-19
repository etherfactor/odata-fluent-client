/**
 * The number of rows to return.
 */
export type Top = number;

/**
 * Converts a $top configuration into a string, for HTTP calls.
 * @param top The base top.
 * @returns The $top string.
 */
export function topToString(top: Top): string {
  const useValue = top.toFixed(0);
  return useValue;
}
