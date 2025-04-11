import { HttpMethod } from "../../../../utils/http";
import { SafeAny } from "../../../../utils/types";
import { NewMockODataClientOptions } from "../../../client/odata-client.mock";
import { EntityKey, EntityKeyType } from "../../client/builder/entity-set-client-builder";
import { EntitySetClient } from "../../client/entity-set-client";
import { EntityNavigation } from "../entity-navigation";
import { EntityNavigationClientMock } from "../entity-navigation.mock";
import { NavigationBuilderAddCardinality, NavigationBuilderAddMethod, NavigationBuilderAddMethodFull, NavigationBuilderAddReference } from "./entity-navigation-builder";

export class EntityNavigationBuilderMock<
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
  private readonly options: NewMockODataClientOptions;
  private readonly fromSet: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
  private readonly navigation: string;

  constructor(
    options: NewMockODataClientOptions,
    entitySet: EntitySetClient<TEntity, TKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>,
    navigation: string,
  ) {
    this.options = options;
    this.fromSet = entitySet;
    this.navigation = navigation;
  }

  withCollection(): NavigationBuilderAddReference<TEntity, TKey, TNavProperty, true> {
    return this as SafeAny;
  }

  withSingle(): NavigationBuilderAddReference<TEntity, TKey, TNavProperty, false> {
    return this as SafeAny;
  }

  private navSet!: EntitySetClient<TNavEntity, TNavKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
  withReference<TNavEntity, TNavKey extends EntityKey<TNavEntity>>(entitySet: EntitySetClient<TNavEntity, TNavKey, any, any, any, any, any>): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, undefined, undefined, undefined, undefined> {
    this.navSet = entitySet;
    return this as SafeAny;
  }

  private add?: HttpMethod;
  withAdd<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TMethod, TRemove, TSet, TUnset> {
    this.add = method;
    return this as SafeAny;
  }

  private remove?: HttpMethod;
  withRemove<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TMethod, TSet, TUnset> {
    this.remove = method;
    return this as SafeAny;
  }

  private set?: HttpMethod;
  withSet<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TMethod, TUnset> {
    this.set = method;
    return this as SafeAny;
  }

  private unset?: HttpMethod;
  withUnset<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TSet, TMethod> {
    this.unset = method;
    return this as SafeAny;
  }

  build(): EntityNavigation<EntityKeyType<TEntity, TKey>, EntityKeyType<TNavEntity, TNavKey>, TAdd, TRemove, TSet, TUnset> {
    return new EntityNavigationClientMock({
      rootOptions: this.options,
      navigation: this.navigation,
      fromSet: this.fromSet as SafeAny,
      toSet: this.navSet as SafeAny,
      add: this.add,
      remove: this.remove,
      set: this.set,
      unset: this.unset,
    });
  }
}
