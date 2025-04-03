import { Count } from "./count";
import { Expand, expandToString } from "./expand";
import { Filter, filterToString } from "./filter";
import { OrderBy, orderByToString } from "./orderby";
import { Select, selectToString } from "./select";
import { Skip, skipToString } from "./skip";
import { Top, topToString } from "./top";

export interface ODataOptions {
  count?: Count;
  expand?: Expand[];
  filter?: Filter[];
  orderBy?: OrderBy[];
  select?: Select[];
  skip?: Skip;
  top?: Top;
}
  
export interface QueryParams {
  [key: string]: string
}

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
