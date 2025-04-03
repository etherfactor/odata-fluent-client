import { ODataClient } from "../../client/odata-client";
import { EntitySetBuilderAddKey } from "../../entity/entity-set-client-builder";
import { EntitySetBuilderMock } from "../entity/entity-set-client-builder.mock";

export interface MockODataClientConfig {
  getEntitySet(name: string): Record<string, object>;
  addIdToEntity: Record<string, (entity: any) => string>;
}

export class MockODataClient extends ODataClient {
  private readonly mockConfig;

  constructor(
    config: MockODataClientConfig,
  ) {
    super({
      serviceUrl: "http://localhost",
      routingType: "parentheses",
      http: { headers: {} },
    });
    this.mockConfig = config;
  }

  entitySet<TEntity>(name: string): EntitySetBuilderAddKey<TEntity> {
    return new EntitySetBuilderMock(this.mockConfig, name);
  }
}
