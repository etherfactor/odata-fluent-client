import { Count } from "./count";
import { Expand, expandToString } from "./expand";
import { Filter, filterToString } from "./filter";
import { OrderBy, orderByToString } from "./orderby";
import { Select, selectToString } from "./select";
import { Skip, skipToString } from "./skip";
import { Top, topToString } from "./top";

/**
 * Contains the OData query options to use when requesting entities.
 */
export interface ODataOptions {
  /**
   * The $count option to apply, if any.
   */
  count?: Count;
  /**
   * The $expand option to apply, if any.
   */
  expand?: Expand[];
  /**
   * The $filter option to apply, if any.
   */
  filter?: Filter[];
  /**
   * The $orderby option to apply, if any.
   */
  orderBy?: OrderBy[];
  /**
   * The $select option to apply, if any.
   */
  select?: Select[];
  /**
   * The $skip option to apply, if any.
   */
  skip?: Skip;
  /**
   * The $top option to apply, if any.
   */
  top?: Top;
}

/**
 * A key-value pair mapping of query parameters and their values.
 */
export interface QueryParams {
  [key: string]: string
}

/**
 * Converts the raw OData options (as used by this library) to a more usable key-value form.
 * @param options The options to convert.
 * @returns The key-value pairs of query options.
 */
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

  if (options.top !== undefined) {
    params["$top"] = topToString(options.top);
  }

  return params;
}
