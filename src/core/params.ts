import { Value } from "../values/base";
import { AndLogicalValue } from "../values/logical";
import { EntityExpand } from "./entity/entity-expand";
import { EntitySelectExpand } from "./entity/entity-select-expand";

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

export function selectExpandToObject(options: ODataOptions): EntitySelectExpand {
  const data: EntitySelectExpand = {
    select: options.select ?? [],
    expand: {},
  };

  for (const expand of options.expand ?? []) {
    data.expand[expand.property] = selectExpandToObject(expand.value.getOptions());
  }

  return data;
}

export type Filter = Value<boolean>;

export function filterToString(filter: Filter[]): string {
  let useValue: string;
  if (filter.length > 1) {
    useValue = new AndLogicalValue(...filter).toString();
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

export function getParams(options: ODataOptions): QueryParams {
  const params: QueryParams = {};

  if (options.count) {
    params["$count"] = "true";
  }

  if (options.expand) {
    params["$expand"] = expandToString(options.expand);
  }

  if (options.filter) {
    params["$filter"] = filterToString(options.filter);
  }

  if (options.orderBy) {
    params["$orderby"] = orderByToString(options.orderBy);
  }

  if (options.select) {
    params["$select"] = selectToString(options.select);
  }

  if (options.skip) {
    params["$skip"] = skipToString(options.skip);
  }

  if (options.top) {
    params["$top"] = topToString(options.top);
  }

  return params;
}
