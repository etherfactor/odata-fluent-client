import { HttpMethod } from "../../../../utils/http";
import { SafeAny } from "../../../../utils/types";
import { EntitySetClient } from "../entity-set-client";
import { EntityNavigation, NavigationType } from "./entity-navigation";

export interface EntityNavigationBuilderAddType<TReference extends string> {
  withCollection(): EntityNavigationBuilderAddReference<TReference, true>;
  withSingle(): EntityNavigationBuilderAddReference<TReference, false>;
}

export interface EntityNavigationBuilderAddReference<TReference extends string, TCollection extends boolean> {
  withReference<TEntity>(lazy: () => EntitySetClient<TEntity, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>): EntityNavigationBuilderAddMethod<TReference, TCollection, TEntity>;
}

export interface EntityNavigationBuilderAddMethodFull<
  TReference extends string,
  TCollection extends boolean,
  TEntity,
  TAdd extends HttpMethod | undefined = undefined,
  TRemove extends HttpMethod | undefined = undefined,
  TSet extends HttpMethod | undefined = undefined,
  TUnset extends HttpMethod | undefined = undefined,
> {
  withAdd<TMethod extends HttpMethod>(method: TMethod): EntityNavigationBuilderAddMethod<TReference, TCollection, TEntity, TMethod, TRemove, TSet, TUnset>;
  withRemove<TMethod extends HttpMethod>(method: TMethod): EntityNavigationBuilderAddMethod<TReference, TCollection, TEntity, TAdd, TMethod, TSet, TUnset>;
  withSet<TMethod extends HttpMethod>(method: TMethod): EntityNavigationBuilderAddMethod<TReference, TCollection, TEntity, TAdd, TRemove, TMethod, TUnset>;
  withUnset<TMethod extends HttpMethod>(method: TMethod): EntityNavigationBuilderAddMethod<TReference, TCollection, TEntity, TAdd, TRemove, TSet, TMethod>;
  build(): EntityNavigation<{ [K in TReference]: NavigationType<TEntity> }>;
}

export type EntityNavigationBuilderAddMethod<
  TReference extends string,
  TCollection extends boolean,
  TEntity,
  TAdd extends HttpMethod | undefined = undefined,
  TRemove extends HttpMethod | undefined = undefined,
  TSet extends HttpMethod | undefined = undefined,
  TUnset extends HttpMethod | undefined = undefined,
> =
  Pick<EntityNavigationBuilderAddMethodFull<TReference, TCollection, TEntity, TAdd, TRemove, TSet, TUnset>, "build"> &
  (TCollection extends true ? (
    (TAdd extends string ? {} : Pick<EntityNavigationBuilderAddMethodFull<TReference, TCollection, TEntity, TAdd, TRemove, TSet, TUnset>, "withAdd">) &
    (TRemove extends string ? {} : Pick<EntityNavigationBuilderAddMethodFull<TReference, TCollection, TEntity, TAdd, TRemove, TSet, TUnset>, "withRemove">)
  ) : (
    (TSet extends string ? {} : Pick<EntityNavigationBuilderAddMethodFull<TReference, TCollection, TEntity, TAdd, TRemove, TSet, TUnset>, "withSet">) &
    (TUnset extends string ? {} : Pick<EntityNavigationBuilderAddMethodFull<TReference, TCollection, TEntity, TAdd, TRemove, TSet, TUnset>, "withUnset">)
  ));
