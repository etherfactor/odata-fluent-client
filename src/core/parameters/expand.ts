import { EntityExpand } from "../entity/expand/entity-expand";
import { EntitySelectExpand } from "../entity/expand/entity-select-expand";
import { ODataOptions } from "./odata-options";

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
