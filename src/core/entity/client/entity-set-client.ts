import { HttpMethod } from "../../../utils/http";
import { EntityDeleteResponse } from "../../response/entity-response";
import { EntitySet } from "../set/entity-set";
import { EntitySingle } from "../single/entity-single";
import { EntityKey, EntityPropertyType } from "./builder/entity-set-client-builder";

export interface EntitySetClientFull<
  TEntity,
  TKey extends EntityKey<TEntity>,
> {
  /**
   * The name of the entity set.
   */
  get name(): string;
  /**
   * [[This is currently an internal API and should not be called.]]
   */
  buildUrl(key: EntityPropertyType<TEntity, TKey>): string;
  /**
   * The entity set, for querying.
   */
  get set(): EntitySet<TEntity>;
  /**
   * Retrieves a single entity.
   * @param key The id of the entity.
   */
  read(key: EntityPropertyType<TEntity, TKey>): EntitySingle<TEntity>;
  /**
   * Creates a new entity.
   * @param entity The data of the entity.
   */
  create(entity: Partial<TEntity>): EntitySingle<TEntity>;
  /**
   * Updates an existing entity.
   * @param key The id of the entity.
   * @param entity The new data of the entity.
   */
  update(key: EntityPropertyType<TEntity, TKey>, entity: Partial<TEntity>): EntitySingle<TEntity>;
  /**
   * Deletes an existing entity.
   * @param key The id of the entity.
   */
  delete(key: EntityPropertyType<TEntity, TKey>): EntityDeleteAction;
}

/**
 * A client that executes against an entity set.
 */
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
  (TDelete extends string ? Pick<EntitySetClientFull<TEntity, TKey>, "delete"> : {}) &
  Pick<EntitySetClientFull<TEntity, TKey>, "name" | "buildUrl">;

export interface EntityDeleteAction {
  /**
   * Executes the entity delete action.
   */
  execute(): EntityDeleteResponse;
}
