import { HttpMethod } from "../../../utils/http";

export interface EntityNavigationFull<
  TKey1,
  TKey2,
> {
  add(from: TKey1, to: TKey2): EntityNavigationAction;
  remove(from: TKey1, to: TKey2): EntityNavigationAction;
  set(from: TKey1, to: TKey2): EntityNavigationAction;
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
  execute(): EntityNavigationResponse;
}

export interface EntityNavigationResponse {
  result: Promise<boolean>;
}
