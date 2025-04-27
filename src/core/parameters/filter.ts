import { Value } from "../../values/base";
import { AndLogicalValue } from "../../values/logical";

/**
 * A condition which evaluates to true or false and is used to filter the records returned.
 */
export type Filter = Value<boolean>;

/**
 * Converts a $filter configuration into a string, for HTTP calls.
 * @param filter The base filter.
 * @returns The $filter string.
 */
export function filterToString(filter: Filter[]): string {
  let useValue: string;
  if (filter.length > 1) {
    useValue = new AndLogicalValue(...filter).toString();
  } else {
    useValue = filter[0].toString();
  }

  return useValue;
}
