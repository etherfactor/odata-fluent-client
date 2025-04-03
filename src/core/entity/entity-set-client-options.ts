import { HttpMethod } from "../../utils/http";
import { Value } from "../../values/base";
import { ODataPathRoutingType } from "../client/odata-client";
import { HttpClientAdapter } from "../http/http-client-adapter";
import { EntitySelectExpand } from "./expand/entity-select-expand";

export interface EntitySetClientOptions {
  serviceUrl: string;
  entitySet: string;
  routingType: ODataPathRoutingType,
  adapter: HttpClientAdapter,
  key: unknown | unknown[];
  keyType: ((value: unknown) => Value<unknown>) | ((value: unknown) => Value<unknown>)[];
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => unknown | Error;
  readSet?: HttpMethod;
  read?: HttpMethod;
  create?: HttpMethod;
  update?: HttpMethod;
  delete?: HttpMethod;
}
