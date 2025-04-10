import { EntityInvokableFull, InvokableFull } from "../invokable/invokable";

export type Action<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  InvokableFull<TParameter, TCollection, TReturn>;

export type EntityAction<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> =
  EntityInvokableFull<TKey, TParameter, TCollection, TReturn>;
