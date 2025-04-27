/**
 * Specifies a column and a direction for sorting.
 */
export interface OrderBy {
  /**
   * The property by which to sort.
   */
  property: string;
  /**
   * The direction in which to sort.
   */
  direction: SortDirection;
}

/**
 * The direction in which to sort.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Converts an $orderby configuration into a string, for HTTP calls.
 * @param orderBy The base order by.
 * @returns The $orderby string.
 */
export function orderByToString(orderBy: OrderBy[]): string {
  const useValue = orderBy.map(orderBy => `${orderBy.property} ${orderBy.direction}`).join(', ');
  return useValue;
}
