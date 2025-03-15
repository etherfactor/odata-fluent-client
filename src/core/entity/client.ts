import { extendUrl, HttpMethod } from "../../utils/http";
import { AnyArray } from "../../utils/types";
import { Value } from "../../values/base";
import { HttpClientAdapter, RoutingType } from "../client";
import { EntitySet, EntitySetImpl, EntitySetWorker, EntitySetWorkerImpl } from "./set";
import { EntitySingle, EntitySingleImpl, EntitySingleWorker, EntitySingleWorkerImpl } from "./single";

type EntityKeyType = string | number | boolean;
export type EntityKey = EntityKeyType | [EntityKeyType, ...EntityKeyType[]];

type EntityKeyValue<TKey> = TKey extends AnyArray
  ? { [K in keyof TKey]: (value: TKey[K]) => Value<TKey[K]> | undefined }
  : (value: TKey) => Value<TKey>;

export interface ResourceOptions<TEntity, TKey extends EntityKey> {
  entitySet: string;
  readSet?: HttpMethod;
  readEntity?: HttpMethod;
  create?: HttpMethod;
  update?: HttpMethod;
  delete?: HttpMethod;
  keySelector: (entity: TEntity) => TKey,
  valueBuilder?: EntityKeyValue<TKey>,
}

interface EntityClientFull<TEntity, TKey extends EntityKey> {
  get set(): EntitySet<TEntity>;
  read(key: TKey): EntitySingle<TEntity>;
  create(entity: Partial<TEntity>): EntitySingle<TEntity>;
  update(key: TKey, entity: Partial<TEntity>): EntitySingle<TEntity>;
  delete(key: TKey): Promise<void>;
}

export type EntityClient<TEntity, TKey extends EntityKey, TOptions extends ResourceOptions<TEntity, TKey>> =
  (TOptions["readSet"] extends string ? Pick<EntityClientFull<TEntity, TKey>, "set"> : {}) &
  (TOptions["readEntity"] extends string ? Pick<EntityClientFull<TEntity, TKey>, "read"> : {}) &
  (TOptions["create"] extends string ? Pick<EntityClientFull<TEntity, TKey>, "create"> : {}) &
  (TOptions["update"] extends string ? Pick<EntityClientFull<TEntity, TKey>, "update"> : {}) &
  (TOptions["delete"] extends string ? Pick<EntityClientFull<TEntity, TKey>, "delete"> : {});

export class EntityClientImpl<TEntity, TKey extends EntityKey, TOptions extends ResourceOptions<TEntity, TKey>> implements EntityClientFull<TEntity, TKey> {
  
  private readonly entitySetUrl: string;
  private readonly adapter: HttpClientAdapter;
  private readonly options: TOptions;

  constructor(
    options: TOptions,
    adapter: HttpClientAdapter,
    serviceUrl: string,
    routingType: RoutingType,
  ) {
    this.options = options;
    this.adapter = adapter;

    this.entitySetUrl = extendUrl(serviceUrl, this.options.entitySet);
  }

  private createSetWorker(
    method: HttpMethod,
    url: string,
    payload?: Partial<TEntity>,
  ): EntitySetWorker<TEntity> {
    return new EntitySetWorkerImpl({
      adapter: this.adapter,
      method: method,
      url: url,
      payload: payload,
    });
  }

  private createSingleWorker(
    method: HttpMethod,
    url: string,
    payload?: Partial<TEntity>,
  ): EntitySingleWorker<TEntity> {
    return new EntitySingleWorkerImpl({
      adapter: this.adapter,
      method: method,
      url: url,
      payload: payload,
    });
  }

  get set(): EntitySet<TEntity> {
    if (!this.options.readSet)
      throw new Error("This resource does not support querying the entity set");

    const url = this.entitySetUrl;
    const worker = this.createSetWorker(this.options.readSet, url);
    return new EntitySetImpl(worker);
  }

  read(key: TKey): EntitySingle<TEntity> {
    if (!this.options.readEntity)
      throw new Error("This resource does not support reading entities");

    const url = `${this.entitySetUrl}(${key})`;
    const worker = this.createSingleWorker(this.options.readEntity, url);
    return new EntitySingleImpl(worker);
  }

  create(entity: Partial<TEntity>): EntitySingle<TEntity> {
    if (!this.options.create)
      throw new Error("This resource does not support creating entities");

    const url = this.entitySetUrl;
    const worker = this.createSingleWorker(this.options.create, url, entity);
    return new EntitySingleImpl(worker);
  }

  update(key: TKey, entity: Partial<TEntity>): EntitySingle<TEntity> {
    if (!this.options.update)
      throw new Error("This resource does not support updating entities");

    const url = this.entitySetUrl;
    const worker = this.createSingleWorker(this.options.update, url, entity);
    return new EntitySingleImpl(worker);
  }

  async delete(key: TKey): Promise<void> {
    if (!this.options.update)
      throw new Error("This resource does not support deleting entities");

    //TODO Add this
  }
}
