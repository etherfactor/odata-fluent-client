import { EntityInvokableFull, InvokableFull } from "../invokable/invokable";

export type Function<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  InvokableFull<TParameter, TCollection, TReturn>;

export type EntityFunction<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  EntityInvokableFull<TKey, TParameter, TCollection, TReturn>;
