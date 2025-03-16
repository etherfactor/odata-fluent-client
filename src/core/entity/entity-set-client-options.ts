import { HttpMethod } from "../../utils/http";
import { Value } from "../../values/base";
import { EntitySelectExpand } from "./entity-select-expand";

export interface EntitySetClientOptions {
  entitySet: string;
  key: unknown | unknown[];
  keyType: ((value: unknown) => Value<unknown>) | ((value: unknown) => Value<unknown>)[];
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => unknown | Error;
  readSet?: HttpMethod;
  read?: HttpMethod;
  create?: HttpMethod;
  update?: HttpMethod;
  delete?: HttpMethod;
}
