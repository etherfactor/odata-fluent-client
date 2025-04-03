export interface OrderBy {
  property: string;
  direction: SortDirection;
}

export type SortDirection = 'asc' | 'desc';

export function orderByToString(orderBy: OrderBy[]): string {
  const useValue = orderBy.map(orderBy => `${orderBy.property} ${orderBy.direction}`).join(', ');
  return useValue;
}
