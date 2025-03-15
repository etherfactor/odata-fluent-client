import { extendUrl, HttpMethod } from "../../utils/http";
import { EntityKey, HttpClientAdapter, RoutingType } from "../client";
import { EntitySet, EntitySetImpl, EntitySetWorker, EntitySetWorkerImpl } from "./set";
import { EntitySingle, EntitySingleImpl, EntitySingleWorker, EntitySingleWorkerImpl } from "./single";

export interface ResourceOptions {
  entitySet: string;
  readSet?: HttpMethod;
  read?: HttpMethod;
  create?: HttpMethod;
  update?: HttpMethod;
  delete?: HttpMethod;
}

interface EntityClientFull<
  TEntity,
  TKey extends EntityKey
> {
  get set(): EntitySet<TEntity>;
  read(key: TKey): EntitySingle<TEntity>;
  create(entity: Partial<TEntity>): EntitySingle<TEntity>;
  update(key: TKey, entity: Partial<TEntity>): EntitySingle<TEntity>;
  delete(key: TKey): Promise<void>;
}

export type EntityClient<
  TEntity,
  TKey extends EntityKey,
  TReadSet extends HttpMethod | undefined = undefined,
  TRead extends HttpMethod | undefined = undefined,
  TCreate extends HttpMethod | undefined = undefined,
  TUpdate extends HttpMethod | undefined = undefined,
  TDelete extends HttpMethod | undefined = undefined,
> =
  (TReadSet extends string ? Pick<EntityClientFull<TEntity, TKey>, "set"> : {}) &
  (TRead extends string ? Pick<EntityClientFull<TEntity, TKey>, "read"> : {}) &
  (TCreate extends string ? Pick<EntityClientFull<TEntity, TKey>, "create"> : {}) &
  (TUpdate extends string ? Pick<EntityClientFull<TEntity, TKey>, "update"> : {}) &
  (TDelete extends string ? Pick<EntityClientFull<TEntity, TKey>, "delete"> : {});

export class EntityClientImpl<TEntity, TKey extends EntityKey> implements EntityClientFull<TEntity, TKey> {
  
  private readonly entitySetUrl: string;
  private readonly adapter: HttpClientAdapter;
  private readonly options: ResourceOptions;

  constructor(
    options: ResourceOptions,
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
    if (!this.options.read)
      throw new Error("This resource does not support reading entities");

    const url = `${this.entitySetUrl}(${key})`;
    const worker = this.createSingleWorker(this.options.read, url);
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
