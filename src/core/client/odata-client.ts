import { SafeAny } from "../../utils/types";
import { EntityAction } from "../action/action";
import { ActionBuilderAddMethod, EntityActionBuilderAddMethod } from "../action/builder/action-builder";
import { ActionBuilderImpl, EntityActionBuilderImpl } from "../action/builder/action-builder.impl";
import { EntityKey, EntitySetBuilderAddKey } from "../entity/client/builder/entity-set-client-builder";
import { EntitySetBuilderImpl } from "../entity/client/builder/entity-set-client-builder.impl";
import { EntitySetClient } from "../entity/client/entity-set-client";
import { NavigationBuilderAddCardinality } from "../entity/navigation/builder/entity-navigation-builder";
import { EntityNavigationBuilderImpl } from "../entity/navigation/builder/entity-navigation-builder.impl";
import { EntityNavigation } from "../entity/navigation/entity-navigation";
import { EntityFunctionBuilderAddMethod, FunctionBuilderAddMethod } from "../function/builder/function-builder";
import { EntityFunctionBuilderImpl, FunctionBuilderImpl } from "../function/builder/function-builder.impl";
import { EntityFunction } from "../function/function";
import { HttpClientAdapter } from "../http/http-client-adapter";

/**
 * Options to configure an OData client.
 */
export interface ODataClientOptions {
  /**
   * The HTTP options.
   */
  http: ODataClientHttpOptions;
  /**
   * The root service url.
   */
  serviceUrl: string;
  /**
   * The routing type used when constructing urls. For example, entities(1) vs. entities/1.
   */
  routingType: ODataPathRoutingType;
}

/**
 * Routing types used when forming OData urls.
 */
export type ODataPathRoutingType = "parentheses" | "slash";

/**
 * The HTTP options.
 */
interface ODataClientHttpOptions {
  /**
   * A custom HTTP adapter. Responsible for fetching data and returning the result.
   */
  adapter?: HttpClientAdapter;
  /**
   * The headers to include, if any. Allows adding an authorization or api key header to the default HTTP adapter.
   */
  headers?: Record<string, string>;
}

/**
 * A fluent OData client.
 */
export class ODataClient {
  private readonly options;
  
  constructor(
    options: ODataClientOptions,
  ) {
    this.options = options;
  }

  /**
   * Fluently builds an entity set.
   * @param name The name of the entity set.
   * @returns The entity set builder.
   */
  entitySet<TEntity>(name: string): EntitySetBuilderAddKey<TEntity> {
    return new EntitySetBuilderImpl({
      rootOptions: this.options,
      entitySet: name,
    });
  }

  /**
   * Fluently builds a navigation property between two entity sets.
   * @param fromSet The entity set containing the navigation property.
   * @param property The referenced entity set.
   * @returns The navigation property builder.
   */
  navigation<TEntity, TKey extends EntityKey<TEntity>, TNavProperty extends keyof TEntity & string>(
    fromSet: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
    property: TNavProperty
  ): NavigationBuilderAddCardinality<TEntity, TKey, TNavProperty> {
    return new EntityNavigationBuilderImpl({
      rootOptions: this.options,
      entitySet: fromSet,
      navigation: property,
    });
  }

  /**
   * Fluently builds an action at the service root.
   * @param name The name of the action.
   * @returns The action builder.
   */
  action(name: string): ActionBuilderAddMethod;
  /**
   * Fluently builds an action on an entity.
   * @param set The entity set on which the action can be invoked.
   * @param name The name of the action.
   * @returns The action builder.
   */
  action<TEntity, TKey extends EntityKey<TEntity>>(set: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>, name: string): EntityActionBuilderAddMethod<TEntity, TKey>;
  action(
    arg1: unknown,
    arg2?: unknown
  ): SafeAny {
    if (typeof arg1 === "string") {
      return new ActionBuilderImpl({
        rootOptions: this.options,
        name: arg1,
      });
    } else {
      return new EntityActionBuilderImpl({
        rootOptions: this.options,
        name: arg2 as string,
        entitySet: arg1 as EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
      });
    }
  }

  /**
   * Fluently builds a function at the service root.
   * @param name The name of the function.
   * @returns The function builder.
   */
  function(name: string): FunctionBuilderAddMethod;
  /**
   * Fluently builds a function on an entity.
   * @param set The entity set on which the function can be invoked.
   * @param name The name of the function.
   * @returns The function builder.
   */
  function<TEntity, TKey extends EntityKey<TEntity>>(set: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>, name: string): EntityFunctionBuilderAddMethod<TEntity, TKey>;
  function(
    arg1: unknown,
    arg2?: unknown
  ): SafeAny {
    if (typeof arg1 === "string") {
      return new FunctionBuilderImpl({
        rootOptions: this.options,
        name: arg1,
      });
    } else {
      return new EntityFunctionBuilderImpl({
        rootOptions: this.options,
        name: arg2 as string,
        entitySet: arg1 as EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
      });
    }
  }

  /**
   * Provides methods for binding additional methods to an entity set client.
   */
  readonly bind = {
    navigation: bindNavigation,
    /**
     * Binds actions to an entity set client.
     */
    action: bindAction,
    /**
     * Binds functions to an entity set client.
     */
    function: bindFunction,
  };
}

/**
 * Binds navigation properties to an entity set client.
 * @param set The entity set.
 * @param navigations An object containing the navigation properties that should be bound.
 * @returns The entity set, with the added navigation properties.
 */
function bindNavigation<
  TSet extends EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
  TNavigation extends { [key: string]: EntityNavigation<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny> }
> (
  set: TSet,
  navigations: TNavigation,
): TSet & { navigations: TNavigation } {
  const maybe = (set as SafeAny).navigations;
  let use;
  if (maybe && typeof maybe === "object") {
    use = {...maybe, ...navigations};
  } else {
    use = {...navigations};
  }
  const newSet: TSet & { navigations: TNavigation } = set as TSet & { navigations: TNavigation };
  newSet.navigations = use;
  return newSet;
};

/**
 * Binds actions to an entity set client.
 * @param set The entity set.
 * @param actions An object containing the actions that should be bound.
 * @returns The entity set, with the added actions.
 */
function bindAction<
  TSet extends EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
  TAction extends { [key: string]: EntityAction<SafeAny, SafeAny, SafeAny, SafeAny> }
> (
  set: TSet,
  actions: TAction
): TSet & { actions: TAction } {
  const maybe = (set as SafeAny).actions;
  let use;
  if (maybe && typeof maybe === "object") {
    use = {...maybe, ...actions};
  } else {
    use = {...actions};
  }
  const newSet: TSet & { actions: TAction } = set as TSet & { actions: TAction };
  newSet.actions = use;
  return newSet;
};

/**
 * Binds functions to an entity set client.
 * @param set The entity set.
 * @param functions An object containing the functions that should be bound.
 * @returns The entity set, with the added functions.
 */
function bindFunction<
  TSet extends EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
  TFunction extends { [key: string]: EntityFunction<SafeAny, SafeAny, SafeAny, SafeAny> }
> (
  set: TSet,
  functions: TFunction
): TSet & { functions: TFunction } {
  const maybe = (set as SafeAny).functions;
  let use;
  if (maybe && typeof maybe === "object") {
    use = {...maybe, ...functions};
  } else {
    use = {...functions};
  }
  const newSet: TSet & { functions: TFunction } = set as TSet & { functions: TFunction };
  newSet.functions = use;
  return newSet;
};
