import { HttpMethod } from "../../utils/http";
import { Value } from "../../values/base";

export interface EntitySetClientOptions {
  entitySet: string;
  key: unknown | unknown[];
  keyType: ((value: unknown) => Value<unknown>) | ((value: unknown) => Value<unknown>)[];
  readSet?: HttpMethod;
  read?: HttpMethod;
  create?: HttpMethod;
  update?: HttpMethod;
  delete?: HttpMethod;
}
