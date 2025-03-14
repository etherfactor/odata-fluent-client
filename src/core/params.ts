import { EntityExpand, o } from "../odata.util";
import { Value } from "../values/base";

export interface QueryParams {
  [key: string]: string
}

export interface ODataOptions {
  count?: Count;
  expand?: Expand[];
  filter?: Filter[];
  orderBy?: OrderBy[];
  select?: Select[];
  skip?: Skip;
  top?: Top;
}

export interface Expand {
  property: string;
  value: EntityExpand<unknown>;
}

export function expandToString(expand: Expand[]): string {
  const useValue = expand.map(expand => expand.value.toString()).join(', ');
  return useValue;
}

export type Filter = Value<boolean>;

export function filterToString(filter: Filter[]): string {
  let useValue: string;
  if (filter.length > 1) {
    useValue = o.and(...filter).toString();
  } else {
    useValue = filter[0].toString();
  }

  return useValue;
}

export type SortDirection = 'asc' | 'desc';

export interface OrderBy {
  property: string;
  direction: SortDirection;
}

export function orderByToString(orderBy: OrderBy[]): string {
  const useValue = orderBy.map(orderBy => `${orderBy.property} ${orderBy.direction}`).join(', ');
  return useValue;
}

export type Select = string;

export function selectToString(select: Select[]): string {
  const useValue = select.join(', ');
  return useValue;
}

export type Skip = number;

export function skipToString(skip: Skip): string {
  const useValue = skip.toFixed(0);
  return useValue;
}

export type Top = number;

export function topToString(top: Top): string {
  const useValue = top.toFixed(0);
  return useValue;
}

export type Count = true;
