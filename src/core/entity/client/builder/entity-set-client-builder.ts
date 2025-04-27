import { HttpMethod } from "../../../../utils/http";
import { AnyArray } from "../../../../utils/types";
import { Value } from "../../../../values/base";
import { EntitySelectExpand } from "../../expand/entity-select-expand";
import { EntitySetClient } from "../entity-set-client";

export interface EntitySetBuilderAddKey<TEntity> {
  /**
   * Specifies the key property of the entity. In the case of a composite key, provide an array of keys.
   * @param key The key of the entity.
   */
  withKey<TKey extends EntityKey<TEntity>>(key: TKey) : EntitySetBuilderAddValue<TEntity, TKey>;
}

export interface EntitySetBuilderAddValue<TEntity, TKey extends EntityKey<TEntity>> {
  /**
   * Provides a mapping between key properties and their value converters, which are needed for building the url.
   * @param builder The value converters.
   */
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
  /**
   * Indicates that the entity set supports querying the entity set.
   * @param method The method used when querying the entity set.
   */
  withReadSet<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TMethod, TRead, TCreate, TUpdate, TDelete, TValidator, TNavigation>;
  /**
   * Indicates that the entity set supports retrieving individual entities.
   * @param method The method used when retrieving entities.
   */
  withRead<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TMethod, TCreate, TUpdate, TDelete, TValidator, TNavigation>;
  /**
   * Indicates that the entity set supports creating entities.
   * @param method The method used when creating entities.
   */
  withCreate<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TMethod, TUpdate, TDelete, TValidator, TNavigation>;
  /**
   * Indicates that the entity set supports updating entities.
   * @param method The method used when updating entities.
   */
  withUpdate<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TMethod, TDelete, TValidator, TNavigation>;
  /**
   * Indicates that the entity set supports deleting entities.
   * @param method The method used when deleting entities.
   */
  withDelete<TMethod extends HttpMethod>(method: TMethod): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TMethod, TValidator, TNavigation>;
  /**
   * Specifies a validator, which will be executed against each returned entity individually. If the validator returns an error, it will be thrown.
   * @param validator The validator.
   */
  withValidator(validator: (value: unknown, selectExpand: EntitySelectExpand) => TEntity | Error): EntitySetBuilderAddMethod<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, true, TNavigation>;
  /**
   * Builds the entity set.
   */
  build(): EntitySetClient<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete>;
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
  Pick<EntitySetBuilderAddMethodFull<TEntity, TKey, TReadSet, TRead, TCreate, TUpdate, TDelete, TValidator, TNavigation>, "build">;

export type EntityKey<TEntity> = keyof TEntity | [keyof TEntity, ...(keyof TEntity)[]];

export type EntityPropertyType<TEntity, TKey> =
  TKey extends (keyof TEntity)[]
    ? { [K in keyof TKey]: TKey[K] extends keyof TEntity ? TEntity[TKey[K]] : never }
    : TKey extends keyof TEntity
    ? TEntity[TKey]
    : never;

export type EntityKeyType<TEntity, TKey extends EntityKey<TEntity>> =
  TKey extends AnyArray
    ? { [K in keyof TKey]: TKey extends keyof TEntity ? TEntity[TKey] : never }
    : TKey extends keyof TEntity ? TEntity[TKey] : never;

export type EntityKeyValue<TKey> =
  TKey extends AnyArray
    ? { [K in keyof TKey]: (value: TKey[K]) => Value<TKey[K]> }
    : (value: TKey) => Value<TKey>;
