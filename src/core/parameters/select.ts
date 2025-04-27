/**
 * Specifies a property being selected. If specified, only the specified proeprties will be returned.
 */
export type Select = string;

/**
 * Converts a $select configuration into a string, for HTTP calls.
 * @param select The base select.
 * @returns The $select string.
 */
export function selectToString(select: Select[]): string {
  const useValue = select.join(', ');
  return useValue;
}
