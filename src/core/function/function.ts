import { EntityInvokableFull, InvokableFull } from "../invokable/invokable";

export type Function<
  TParameter extends {},
  TReturn,
> =
  InvokableFull<TParameter, TReturn>;

export type EntityFunction<
  TKey,
  TParameter extends {},
  TReturn,
> =
  EntityInvokableFull<TKey, TParameter, TReturn>;
