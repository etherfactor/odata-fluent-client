import { SafeAny } from "../../utils/types";
import { EntityKey, EntitySetBuilderAddKey } from "../entity/client/builder/entity-set-client-builder";
import { EntitySetBuilderMock } from "../entity/client/builder/entity-set-client-builder.mock";
import { EntitySetClient } from "../entity/client/entity-set-client";
import { NavigationBuilderAddCardinality } from "../entity/navigation/builder/entity-navigation-builder";
import { EntityNavigationBuilderMock } from "../entity/navigation/builder/entity-navigation-builder.mock";
import { ODataClient } from "./odata-client";

export interface MockODataClientOptions {
  getEntitySet(name: string): Record<string, object>;
  addIdToEntity: Record<string, (entity: any) => string>;
}

export interface NewMockODataClientOptions {
  entitySets: {
    [name: string]: {
      data: () => Record<string, SafeAny>;
      id: string | string[];
      idGenerator: () => SafeAny | SafeAny[];
      onCreate?: (entity: SafeAny) => void;
      onUpdate?: (entity: SafeAny) => void;
      onDelete?: (entity: SafeAny) => void;
      navigations?: {
        [property: string]: {
          targetEntitySet: string;
          type: "collection" | "single";
          onAdd?: (sourceEntity: SafeAny, targetEntity: SafeAny) => void;
          onRemove?: (sourceEntity: SafeAny, targetEntity: SafeAny) => void;
          onSet?: (sourceEntity: SafeAny, targetEntity: SafeAny) => void;
          onUnset?: (sourceEntity: SafeAny, targetEntity: SafeAny) => void;
        }
      };
    }
  };
  actions: {
    [name: string]: {
      entitySet?: string;
      handler: ((parameters: SafeAny) => SafeAny) |
        ((entityKey: SafeAny, parameters: SafeAny) => SafeAny);
    }
  };
  functions: {
    [name: string]: {
      entitySet?: string;
      handler: ((parameters: SafeAny) => SafeAny) |
        ((entityKey: SafeAny, parameters: SafeAny) => SafeAny);
    }
  };
}

export class MockODataClient extends ODataClient {
  private readonly mockOptions;

  constructor(
    options: NewMockODataClientOptions,
  ) {
    super({
      serviceUrl: "http://localhost",
      routingType: "parentheses",
      http: { headers: {} },
    });
    this.mockOptions = options;
  }

  override entitySet<TEntity>(name: string): EntitySetBuilderAddKey<TEntity> {
    return new EntitySetBuilderMock({
      rootOptions: this.mockOptions,
      entitySet: name,
    });
  }

  override navigation<TEntity, TKey extends EntityKey<TEntity>, TNavProperty extends keyof TEntity & string>(
    fromSet: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
    property: TNavProperty
  ): NavigationBuilderAddCardinality<TEntity, TKey, TNavProperty> {
    return new EntityNavigationBuilderMock(this.mockOptions, fromSet, property);
  }
}
