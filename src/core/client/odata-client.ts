import { SafeAny } from "../../utils/types";
import { EntityAction } from "../action/action";
import { ActionBuilderAddMethod, EntityActionBuilderAddMethod } from "../action/action-builder";
import { EntityKey, EntitySetBuilderAddKey } from "../entity/client/builder/entity-set-client-builder";
import { EntitySetBuilderImpl } from "../entity/client/builder/entity-set-client-builder.impl";
import { EntitySetClient } from "../entity/client/entity-set-client";
import { Navigation } from "../entity/navigation/entity-navigation";
import { NavigationBuilderAddCardinality } from "../entity/navigation/entity-navigation-builder";
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
    return undefined!;
  }

  action(name: string): ActionBuilderAddMethod;
  action<TEntity, TKey extends EntityKey<TEntity>>(set: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>, name: string): EntityActionBuilderAddMethod<TEntity, TKey>;
  action(
    set: unknown,
    name?: unknown
  ): any {
    return undefined!;
  }

  readonly bind = {
    navigation: bindNavigation,
    action: bindAction,
  };
}

function bindNavigation<
  TSet extends EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
  TNavigation extends { [key: string]: Navigation<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny> }
> (
  set: TSet,
  navigations: TNavigation,
): TSet & { navigations: TNavigation } {
  return undefined!;
};

function bindAction<
  TSet extends EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
  TAction extends { [key: string]: EntityAction<SafeAny, SafeAny, SafeAny> }
> (
  set: TSet,
  actions: TAction
): TSet & { actions: TAction } {
  return undefined!
};
