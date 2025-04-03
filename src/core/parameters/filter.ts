import { Value } from "../../values/base";
import { AndLogicalValue } from "../../values/logical";

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
