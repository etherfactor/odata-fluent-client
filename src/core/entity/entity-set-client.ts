import { EntitySet, EntitySingle } from "../..";
import { HttpMethod } from "../../utils/http";
import { EntityKey, EntityPropertyType } from "./entity-set-client-builder";

export interface EntitySetClientFull<
  TEntity,
  TKey extends EntityKey<TEntity>
> {
  get set(): EntitySet<TEntity>;
  read(key: EntityPropertyType<TEntity, TKey>): EntitySingle<TEntity>;
  create(entity: Partial<TEntity>): EntitySingle<TEntity>;
  update(key: EntityPropertyType<TEntity, TKey>, entity: Partial<TEntity>): EntitySingle<TEntity>;
  delete(key: EntityPropertyType<TEntity, TKey>): Promise<void>;
}

export type EntitySetClient<
  TEntity,
  TKey extends EntityKey<TEntity>,
  TReadSet extends HttpMethod | undefined = undefined,
  TRead extends HttpMethod | undefined = undefined,
  TCreate extends HttpMethod | undefined = undefined,
  TUpdate extends HttpMethod | undefined = undefined,
  TDelete extends HttpMethod | undefined = undefined,
> =
  (TReadSet extends string ? Pick<EntitySetClientFull<TEntity, TKey>, "set"> : {}) &
  (TRead extends string ? Pick<EntitySetClientFull<TEntity, TKey>, "read"> : {}) &
  (TCreate extends string ? Pick<EntitySetClientFull<TEntity, TKey>, "create"> : {}) &
  (TUpdate extends string ? Pick<EntitySetClientFull<TEntity, TKey>, "update"> : {}) &
  (TDelete extends string ? Pick<EntitySetClientFull<TEntity, TKey>, "delete"> : {});
