import { HttpMethod } from "../../../utils/http";
import { EntityNavigationResponse } from "../../response/entity-response";

/**
 * A client for managing entity navigations.
 */
export interface EntityNavigationFull<
  TKey1,
  TKey2,
> {
  /**
   * Adds an association between two entities.
   * @param from The entity containing the collection.
   * @param to The entity to add to the collection.
   */
  add(from: TKey1, to: TKey2): EntityNavigationAction;
  /**
   * Removes an association between two entities.
   * @param from The entity containing the collection.
   * @param to The entity to remove from the collection.
   */
  remove(from: TKey1, to: TKey2): EntityNavigationAction;
  /**
   * Sets an association between two entities.
   * @param from The entity containing the association.
   * @param to The entity to set as the association.
   */
  set(from: TKey1, to: TKey2): EntityNavigationAction;
  /**
   * Removes an association between two entities.
   * @param from The entity containing the association.
   * @param to The entity to remove as the association.
   */
  unset(from: TKey1, to: TKey2): EntityNavigationAction;
}

export type EntityNavigation<
  TKey1,
  TKey2,
  TAdd extends HttpMethod | undefined = undefined,
  TRemove extends HttpMethod | undefined = undefined,
  TSet extends HttpMethod | undefined = undefined,
  TUnset extends HttpMethod | undefined = undefined,
> =
  (TAdd extends string ? Pick<EntityNavigationFull<TKey1, TKey2>, "add"> : {}) &
  (TRemove extends string ? Pick<EntityNavigationFull<TKey1, TKey2>, "remove"> : {}) &
  (TSet extends string ? Pick<EntityNavigationFull<TKey1, TKey2>, "set"> : {}) &
  (TUnset extends string ? Pick<EntityNavigationFull<TKey1, TKey2>, "unset"> : {});

export interface EntityNavigationAction {
  /**
   * Executes the navigation change action.
   */
  execute(): EntityNavigationResponse;
}
