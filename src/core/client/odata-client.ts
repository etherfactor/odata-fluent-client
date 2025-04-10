import { SafeAny } from "../../utils/types";
import { EntityAction } from "../action/action";
import { ActionBuilderAddMethod, EntityActionBuilderAddMethod } from "../action/action-builder";
import { EntityKey, EntitySetBuilderAddKey } from "../entity/client/builder/entity-set-client-builder";
import { EntitySetBuilderImpl } from "../entity/client/builder/entity-set-client-builder.impl";
import { EntitySetClient } from "../entity/client/entity-set-client";
import { NavigationBuilderAddCardinality } from "../entity/navigation/builder/entity-navigation-builder";
import { EntityNavigationBuilderImpl } from "../entity/navigation/builder/entity-navigation-builder.impl";
import { EntityNavigation } from "../entity/navigation/entity-navigation";
import { EntityFunction } from "../function/function";
import { EntityFunctionBuilderAddMethod, FunctionBuilderAddMethod } from "../function/function-builder";
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

  navigation<TEntity, TKey extends EntityKey<TEntity>, TNavProperty extends keyof TEntity & string>(
    fromSet: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
    property: TNavProperty
  ): NavigationBuilderAddCardinality<TEntity, TKey, TNavProperty> {
    return new EntityNavigationBuilderImpl(this.options, fromSet, property);
  }

  action(name: string): ActionBuilderAddMethod;
  action<TEntity, TKey extends EntityKey<TEntity>>(set: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>, name: string): EntityActionBuilderAddMethod<TEntity, TKey>;
  action(
    set: unknown,
    name?: unknown
  ): any {
    return undefined!;
  }

  function(name: string): FunctionBuilderAddMethod;
  function<TEntity, TKey extends EntityKey<TEntity>>(set: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>, name: string): EntityFunctionBuilderAddMethod<TEntity, TKey>;
  function(
    set: unknown,
    name?: unknown
  ): any {
    return undefined!;
  }

  readonly bind = {
    navigation: bindNavigation,
    action: bindAction,
    function: bindFunction,
  };
}

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
  (set as SafeAny).navigations = use;
  return use;
};

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
  (set as SafeAny).actions = use;
  return use;
};

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
  (set as SafeAny).functions = use;
  return use;
};
