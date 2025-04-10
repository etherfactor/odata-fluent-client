import { EntitySet } from "../entity/set/entity-set";
import { EntitySingle } from "../entity/single/entity-single";

export interface InvokableFull<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> {
  invoke(parameters: TParameter):
    TCollection extends true
      ? EntitySet<TReturn>
      : EntitySingle<TReturn>;
}

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
  invoke(key: TKey, parameters: TParameter):
    TCollection extends true
      ? EntitySet<TReturn>
      : EntitySingle<TReturn>;
}

export type EntityInvokable<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  EntityInvokableFull<TKey, TParameter, TCollection, TReturn>;
