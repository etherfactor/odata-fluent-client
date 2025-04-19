import { EntityExpand } from "../entity/expand/entity-expand";
import { EntitySelectExpand } from "../entity/expand/entity-select-expand";
import { ODataOptions } from "./odata-options";

/**
 * The associated entity expansions.
 */
export interface Expand {
  /**
   * The property being expanded.
   */
  property: string;
  /**
   * The expansion configuration.
   */
  value: EntityExpand<unknown>;
}

/**
 * Converts an $expand configuration into a string, for HTTP calls.
 * @param expand The base expand.
 * @returns The $expand string.
 */
export function expandToString(expand: Expand[]): string {
  const useValue = expand.map(expand => expand.value.toString()).join(', ');
  return useValue;
}

/**
 * Converts a $select/$expand into a basic object, for custom expansion logic.
 * @param options The base select/expand.
 * @returns The basic select/expand object.
 */
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
