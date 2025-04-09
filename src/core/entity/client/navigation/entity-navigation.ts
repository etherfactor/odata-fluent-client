import { HttpMethod } from "../../../../utils/http";

export interface NavigationFull<
  TKey1,
  TKey2,
> {
  //readonly property: TNavProperty;
  add(from: TKey1, to: TKey2): void;
  remove(from: TKey1, to: TKey2): void;
  set(from: TKey1, to: TKey2): void;
  unset(from: TKey1, to: TKey2): void;
}

export type Navigation<
  TKey1,
  TKey2,
  TAdd extends HttpMethod | undefined = undefined,
  TRemove extends HttpMethod | undefined = undefined,
  TSet extends HttpMethod | undefined = undefined,
  TUnset extends HttpMethod | undefined = undefined,
> =
  (TAdd extends string ? Pick<NavigationFull<TKey1, TKey2>, "add"> : {}) &
  (TRemove extends string ? Pick<NavigationFull<TKey1, TKey2>, "remove"> : {}) &
  (TSet extends string ? Pick<NavigationFull<TKey1, TKey2>, "set"> : {}) &
  (TUnset extends string ? Pick<NavigationFull<TKey1, TKey2>, "unset"> : {});
