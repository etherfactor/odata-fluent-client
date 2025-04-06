import { HttpMethod } from "../../../../utils/http";
import { AnyArray } from "../../../../utils/types";
import { Value } from "../../../../values/base";
import { EntitySelectExpand } from "../../expand/entity-select-expand";
import { EntitySetClient } from "../entity-set-client";
import { EntityNavigation } from "../navigation/entity-navigation";
import { EntityNavigationBuilderAddType } from "../navigation/entity-navigation-builder";

export interface EntitySetBuilderAddKey<TEntity> {
  withKey<TKey extends EntityKey<TEntity>>(key: TKey) : EntitySetBuilderAddValue<TEntity, TKey>;
}

export interface EntitySetBuilderAddValue<TEntity, TKey extends EntityKey<TEntity>> {
  withKeyType(builder: EntityKeyValue<EntityPropertyType<TEntity, TKey>>): EntitySetBuilderAddMethod<TEntity, TKey>;
}

export interface EntitySetBuilderAddMethodFull<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TReadSet extends HttpMethod | undefined = undefined,
  TRead extends HttpMethod | undefined = undefined,
  TCreate extends HttpMethod | undefined = undefined,
  TUpdate extends HttpMethod | undefined = undefined,
  TDelete extends HttpMethod | undefined = undefined,
  TValidator extends true | undefined = undefined,
  TNavigation extends {} = {},
> {
  withReadSet<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TMethod, TRead, TCreate, TUpdate, TDelete, TValidator, TNavigation>;
  withRead<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TMethod, TCreate, TUpdate, TDelete, TValidator, TNavigation>;
  withCreate<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TMethod, TUpdate, TDelete, TValidator, TNavigation>;
  withUpdate<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TMethod, TDelete, TValidator, TNavigation>;
  withDelete<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TMethod, TValidator, TNavigation>;
  withValidator(validator: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, true, TNavigation>;
  withNavigation<TNavKey extends (keyof TEntity & string), TNewNav extends {}>(navigation: TNavKey, builder: (nav: EntityNavigationBuilderAddType<TNavKey>) => EntityNavigation<TNewNav>): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, true, TNavigation & TNewNav>;
  build(): EntitySetClient<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TNavigation>;
}

export type EntitySetBuilderAddMethod<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TReadSet extends HttpMethod | undefined = undefined,
  TRead extends HttpMethod | undefined = undefined,
  TCreate extends HttpMethod | undefined = undefined,
  TUpdate extends HttpMethod | undefined = undefined,
  TDelete extends HttpMethod | undefined = undefined,
  TValidator extends true | undefined = undefined,
  TNavigation extends {} = {},
> =
  (TReadSet extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator, TNavigation>, "withReadSet">) &
  (TRead extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator, TNavigation>, "withRead">) &
  (TCreate extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator, TNavigation>, "withCreate">) &
  (TUpdate extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator, TNavigation>, "withUpdate">) &
  (TDelete extends string ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator, TNavigation>, "withDelete">) &
  (TValidator extends true ? {} : Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator, TNavigation>, "withValidator">) &
  Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator, TNavigation>, "withNavigation" | "build">;

export type EntityKey<TEntity> = keyof TEntity | [keyof TEntity, ...(keyof TEntity)[]];

export type EntityPropertyType<TEntity, TKey> =
  TKey extends (keyof TEntity)[]
    ? { [K in keyof TKey]: TKey[K] extends keyof TEntity ? TEntity[TKey[K]] : never }
    : TKey extends keyof TEntity
    ? TEntity[TKey]
    : never;

export type EntityKeyValue<TKey> =
  TKey extends AnyArray
    ? { [K in keyof TKey]: (value: TKey[K]) => Value<TKey[K]> }
    : (value: TKey) => Value<TKey>;
