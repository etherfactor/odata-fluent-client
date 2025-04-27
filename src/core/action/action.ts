import { EntityInvokableFull, InvokableFull } from "../invokable/invokable";

/**
 * A client that invokes an action at the service root.
 */
export type Action<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  InvokableFull<TParameter, TCollection, TReturn>;

/**
 * A client that invokes an action on an entity.
 */
export type EntityAction<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  EntityInvokableFull<TKey, TParameter, TCollection, TReturn>;
