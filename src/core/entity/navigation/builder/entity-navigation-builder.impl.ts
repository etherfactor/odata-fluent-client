import { HttpMethod } from "../../../../utils/http";
import { SafeAny } from "../../../../utils/types";
import { ODataClientOptions } from "../../../client/odata-client";
import { EntityKey, EntityKeyType } from "../../client/builder/entity-set-client-builder";
import { EntitySetClient } from "../../client/entity-set-client";
import { EntityNavigation } from "../entity-navigation";
import { EntityNavigationClientImpl } from "../entity-navigation.impl";
import { NavigationBuilderAddCardinality, NavigationBuilderAddMethod, NavigationBuilderAddMethodFull, NavigationBuilderAddReference } from "./entity-navigation-builder";

export interface EntityNavigationBuilderImplOptions {
  rootOptions: ODataClientOptions;
  entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
  navigation: string;
}

/**
 * A builder for a physical navigation client.
 */
export class EntityNavigationBuilderImpl<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TNavProperty extends keyof TEntity & string,
  TNavEntity,
  TNavKey extends EntityKey<TNavEntity>,
  TCollection extends boolean,
  TAdd extends HttpMethod | undefined = undefined,
  TRemove extends HttpMethod | undefined = undefined,
  TSet extends HttpMethod | undefined = undefined,
  TUnset extends HttpMethod | undefined = undefined,
> implements NavigationBuilderAddCardinality<TEntity, TKey, TNavProperty>,
  NavigationBuilderAddReference<TEntity, TKey, TNavProperty, TCollection>,
  NavigationBuilderAddMethodFull<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TSet, TUnset>
{
  private readonly options;

  constructor(
    options: EntityNavigationBuilderImplOptions,
  ) {
    this.options = options;
  }

  withCollection(): NavigationBuilderAddReference<TEntity, TKey, TNavProperty, true> {
    return this as SafeAny;
  }

  withSingle(): NavigationBuilderAddReference<TEntity, TKey, TNavProperty, false> {
    return this as SafeAny;
  }

  navSet!: EntitySetClient<TNavEntity, TNavKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
  withReference<TNavEntity, TNavKey extends EntityKey<TNavEntity>>(entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, undefined, undefined, undefined, undefined> {
    this.navSet = entitySet;
    return this as SafeAny;
  }

  add?: HttpMethod;
  withAdd<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TMethod, TRemove, TSet, TUnset> {
    this.add = method;
    return this as SafeAny;
  }

  remove?: HttpMethod;
  withRemove<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TMethod, TSet, TUnset> {
    this.remove = method;
    return this as SafeAny;
  }

  set?: HttpMethod;
  withSet<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TMethod, TUnset> {
    this.set = method;
    return this as SafeAny;
  }

  unset?: HttpMethod;
  withUnset<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TSet, TMethod> {
    this.unset = method;
    return this as SafeAny;
  }

  build(): EntityNavigation<EntityKeyType<TEntity, TKey>, EntityKeyType<TNavEntity, TNavKey>, TAdd, TRemove, TSet, TUnset> {
    return new EntityNavigationClientImpl({
      rootOptions: this.options.rootOptions,
      navigation: this.options.navigation,
      fromSet: this.options.entitySet,
      toSet: this.navSet,
      add: this.add,
      remove: this.remove,
      set: this.set,
      unset: this.unset,
    });
  }
}
