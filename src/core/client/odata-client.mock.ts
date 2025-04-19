import { SafeAny } from "../../utils/types";
import { ActionBuilderAddMethod, EntityActionBuilderAddMethod } from "../action/builder/action-builder";
import { ActionBuilderMock, EntityActionBuilderMock } from "../action/builder/action-builder.mock";
import { EntityKey, EntitySetBuilderAddKey } from "../entity/client/builder/entity-set-client-builder";
import { EntitySetBuilderMock } from "../entity/client/builder/entity-set-client-builder.mock";
import { EntitySetClient } from "../entity/client/entity-set-client";
import { NavigationBuilderAddCardinality } from "../entity/navigation/builder/entity-navigation-builder";
import { EntityNavigationBuilderMock } from "../entity/navigation/builder/entity-navigation-builder.mock";
import { EntityFunctionBuilderAddMethod, FunctionBuilderAddMethod } from "../function/builder/function-builder";
import { EntityFunctionBuilderMock, FunctionBuilderMock } from "../function/builder/function-builder.mock";
import { ODataClient } from "./odata-client";

/**
 * Options to configure an in-memory mock of an OData client.
 */
export interface MockODataClientOptions {
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
      handler: ((entityKey: SafeAny, parameters: SafeAny) => SafeAny);
    }
  };
  functions: {
    [name: string]: {
      entitySet?: string;
      handler: ((entityKey: SafeAny, parameters: SafeAny) => SafeAny);
    }
  };
}

/**
 * A fluent OData client mock.
 */
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
    return new EntityNavigationBuilderMock({
      rootOptions: this.mockOptions,
      entitySet: fromSet,
      navigation: property,
    });
  }

  override action(name: string): ActionBuilderAddMethod;
  override action<TEntity, TKey extends EntityKey<TEntity>>(set: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>, name: string): EntityActionBuilderAddMethod<TEntity, TKey>;
  override action(
    arg1: unknown,
    arg2?: unknown
  ): SafeAny {
    if (typeof arg1 === "string") {
      return new ActionBuilderMock({
        rootOptions: this.mockOptions,
        name: arg1,
      });
    } else {
      return new EntityActionBuilderMock({
        rootOptions: this.mockOptions,
        name: arg2 as string,
      });
    }
  }

  override function(name: string): FunctionBuilderAddMethod;
  override function<TEntity, TKey extends EntityKey<TEntity>>(set: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>, name: string): EntityFunctionBuilderAddMethod<TEntity, TKey>;
  override function(
    arg1: unknown,
    arg2?: unknown
  ): SafeAny {
    if (typeof arg1 === "string") {
      return new FunctionBuilderMock({
        rootOptions: this.mockOptions,
        name: arg1,
      });
    } else {
      return new EntityFunctionBuilderMock({
        rootOptions: this.mockOptions,
        name: arg2 as string,
      });
    }
  }
}
