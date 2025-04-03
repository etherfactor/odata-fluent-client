import { EntitySetBuilderAddKey } from "../entity/client/builder/entity-set-client-builder";
import { EntitySetBuilderMock } from "../entity/client/builder/entity-set-client-builder.mock";
import { ODataClient } from "./odata-client";

export interface MockODataClientOptions {
  getEntitySet(name: string): Record<string, object>;
  addIdToEntity: Record<string, (entity: any) => string>;
}

export class MockODataClient extends ODataClient {
  private readonly mockOptions;

  constructor(
    options: MockODataClientOptions,
  ) {
    super({
      serviceUrl: "http://localhost",
      routingType: "parentheses",
      http: { headers: {} },
    });
    this.mockOptions = options;
  }

  entitySet<TEntity>(name: string): EntitySetBuilderAddKey<TEntity> {
    return new EntitySetBuilderMock(this.mockOptions, name);
  }
}
