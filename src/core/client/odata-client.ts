import { EntitySetBuilderAddKey } from "../entity/client/builder/entity-set-client-builder";
import { EntitySetBuilderImpl } from "../entity/client/builder/entity-set-client-builder.impl";
import { HttpClientAdapter } from "../http/http-client-adapter";

export interface ODataClientOptions {
  http: ODataClientHttpOptions;
  serviceUrl: string;
  routingType: ODataPathRoutingType;
}

export type ODataPathRoutingType = "parentheses" | "slash";

interface ODataClientHttpOptions {
  adapter?: HttpClientAdapter;
  headers?: Record<string, string>;
}

export class ODataClient {
  private readonly options;
  
  constructor(
    options: ODataClientOptions,
  ) {
    this.options = options;
  }

  entitySet<TEntity>(name: string): EntitySetBuilderAddKey<TEntity> {
    return new EntitySetBuilderImpl(this.options, name);
  }
}
