/**
 * The number of sorted rows to skip, before returning any rows.
 */
export type Skip = number;

/**
 * Converts a $skip configuration into a string, for HTTP calls.
 * @param skip The base skip.
 * @returns The $skip string.
 */
export function skipToString(skip: Skip): string {
  const useValue = skip.toFixed(0);
  return useValue;
}
