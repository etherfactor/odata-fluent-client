import { EntitySetBuilderAddKey, EntitySetBuilderImpl } from "./entity/entity-set-client-builder";
import { MockODataClientConfig, ODataClientConfig } from "./odata-client-config";

export class ODataClient {
  private readonly config;
  
  constructor(
    config: ODataClientConfig,
  ) {
    this.config = config;
  }

  entitySet<TEntity>(name: string): EntitySetBuilderAddKey<TEntity> {
    return new EntitySetBuilderImpl(this.config, name);
  }
}

export class MockODataClient {
  private readonly config;

  constructor(
    config: MockODataClientConfig,
  ) {
    this.config = config;
  }

  entitySet<TEntity>(name: string): EntitySetBuilderAddKey<TEntity> {
    return new EntitySetBuilderImpl(this.config, name);
  }
}
