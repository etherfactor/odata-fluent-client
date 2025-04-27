import { HttpMethod } from "../../../../utils/http";
import { SafeAny } from "../../../../utils/types";
import { EntityKey, EntityKeyType } from "../../client/builder/entity-set-client-builder";
import { EntitySetClient } from "../../client/entity-set-client";
import { EntityNavigation } from "../entity-navigation";

export interface NavigationBuilderAddCardinality<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TNavProperty extends keyof TEntity & string,
> {
  /**
   * The navigation is a one-to-many relationship.
   */
  withCollection():
    NavigationBuilderAddReference<TEntity, TKey, TNavProperty, true>;
  /**
   * The navigation is a one-to-one relationship.
   */
  withSingle():
    NavigationBuilderAddReference<TEntity, TKey, TNavProperty, false>;
}

export interface NavigationBuilderAddReference<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TNavProperty extends keyof TEntity & string,
  TCollection extends boolean,
> {
  /**
   * Specifies the referenced entity set.
   * @param entitySet The referenced entity set.
   */
  withReference<TNavEntity, TNavKey extends EntityKey<TNavEntity>>(entitySet: EntitySetClient<TNavEntity, TNavKey, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>):
    NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, undefined, undefined, undefined, undefined>;
}

export interface NavigationBuilderAddMethodFull<
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
> {
  /**
   * Indicates that the navigation property supports adding entities.
   * @param method The method used when adding entities.
   */
  withAdd<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TMethod, TRemove, TSet, TUnset>;
  /**
   * Indicates that the navigation property supports removing entities.
   * @param method The method used when removing entities.
   */
  withRemove<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TMethod, TSet, TUnset>;
  /**
   * Indicates that the navigation property supports setting entities.
   * @param method The method used when setting entities.
   */
  withSet<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TMethod, TUnset>;
  /**
   * Indicates that the navigation property supports unsetting entities.
   * @param method The method used when unsetting entities.
   */
  withUnset<TMethod extends HttpMethod>(method: TMethod): NavigationBuilderAddMethod<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TSet, TMethod>;
  /**
   * Builds the navigation client.
   */
  build(): EntityNavigation<EntityKeyType<TEntity, TKey>, EntityKeyType<TNavEntity, TNavKey>, TAdd, TRemove, TSet, TUnset>;
}

export type NavigationBuilderAddMethod<
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
> =
  (TCollection extends true ? (
    (TAdd extends string ? {} : Pick<NavigationBuilderAddMethodFull<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TSet, TUnset>, "withAdd">) &
    (TRemove extends string ? {} : Pick<NavigationBuilderAddMethodFull<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TSet, TUnset>, "withRemove">)  
  ) : (
    (TSet extends string ? {} : Pick<NavigationBuilderAddMethodFull<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TSet, TUnset>, "withSet">) &
    (TUnset extends string ? {} : Pick<NavigationBuilderAddMethodFull<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TSet, TUnset>, "withUnset">)
  )) &
  Pick<NavigationBuilderAddMethodFull<TEntity, TKey, TNavProperty, TNavEntity, TNavKey, TCollection, TAdd, TRemove, TSet, TUnset>, "build">;
  