import { EntityInvokableFull, InvokableFull } from "../invokable/invokable";

/**
 * A client that invokes an action at the service root.
 */
export type Function<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  InvokableFull<TParameter, TCollection, TReturn>;

/**
 * A client that invokes an action on an entity.
 */
export type EntityFunction<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  EntityInvokableFull<TKey, TParameter, TCollection, TReturn>;
