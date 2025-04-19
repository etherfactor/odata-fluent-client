import { EntitySet } from "../entity/set/entity-set";
import { EntitySingle } from "../entity/single/entity-single";

export interface InvokableFull<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> {
  /**
   * Specifies parameters for the invokable.
   * @param parameters The parameters to send.
   */
  invoke(parameters: TParameter):
    TCollection extends true
      ? EntitySet<TReturn>
      : EntitySingle<TReturn>;
}

/**
 * A client that invokes something at the service root.
 */
export type Invokable<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  InvokableFull<TParameter, TCollection, TReturn>;

export interface EntityInvokableFull<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> {
  /**
   * Specifies parameters for the invokable.
   * @param key The id of the entity upon which this invokable is executed.
   * @param parameters The parameters to send.
   */
  invoke(key: TKey, parameters: TParameter):
    TCollection extends true
      ? EntitySet<TReturn>
      : EntitySingle<TReturn>;
}

/**
 * A client that invokes something on an entity.
 */
export type EntityInvokable<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  EntityInvokableFull<TKey, TParameter, TCollection, TReturn>;
