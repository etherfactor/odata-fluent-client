import { extendUrl, HttpMethod } from "../../utils/http";
import { Value } from "../../values/base";
import { HttpClientAdapter } from "../http-client-adapter";
import { ODataPathRoutingType } from "../odata-client-config";
import { EntitySet, EntitySetImpl, EntitySetWorker, EntitySetWorkerImpl } from "./entity-set";
import { EntityKey, EntityPropertyType } from "./entity-set-client-builder";
import { EntitySetClientOptions } from "./entity-set-client-options";
import { EntitySingle, EntitySingleImpl, EntitySingleWorker, EntitySingleWorkerImpl } from "./entity-single";

interface EntitySetClientFull<
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

export class EntitySetClientImpl<TEntity, TKey extends EntityKey<TEntity>> implements EntitySetClientFull<TEntity, TKey> {
  
  private readonly options: EntitySetClientOptions;
  private readonly entitySetUrl: string;
  private readonly adapter: HttpClientAdapter;
  private readonly routingType: ODataPathRoutingType;

  constructor(
    options: EntitySetClientOptions,
    adapter: HttpClientAdapter,
    serviceUrl: string,
    routingType: ODataPathRoutingType,
  ) {
    this.options = options;
    this.adapter = adapter;
    this.routingType = routingType;

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

  read(key: EntityPropertyType<TEntity, TKey>): EntitySingle<TEntity> {
    if (!this.options.read)
      throw new Error("This resource does not support reading entities");

    const url = extendEntityUrl(this.entitySetUrl, this.routingType, this.options.key, key, this.options.keyType);
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

  update(key: EntityPropertyType<TEntity, TKey>, entity: Partial<TEntity>): EntitySingle<TEntity> {
    if (!this.options.update)
      throw new Error("This resource does not support updating entities");

    const url = extendEntityUrl(this.entitySetUrl, this.routingType, this.options.key, key, this.options.keyType);
    const worker = this.createSingleWorker(this.options.update, url, entity);
    return new EntitySingleImpl(worker);
  }

  async delete(key: EntityPropertyType<TEntity, TKey>): Promise<void> {
    if (!this.options.update)
      throw new Error("This resource does not support deleting entities");

    const url = extendEntityUrl(this.entitySetUrl, this.routingType, this.options.key, key, this.options.keyType);
    //TODO Add this
  }
}

function extendEntityUrl(url: string, routingType: ODataPathRoutingType, keyName: unknown | unknown[], key: unknown | unknown[], keyType: ((value: unknown) => Value<unknown>) | ((value: unknown) => Value<unknown>)[]) {
  let useId: string;
  if (Array.isArray(keyName) && Array.isArray(key) && Array.isArray(keyType)) {
    useId = key.map((item, i) => {
      const origKeyName = keyName[i] as string;
      const useKeyName = origKeyName.substring(0, 1).toUpperCase() + origKeyName.substring(1);
      return `${useKeyName}=${keyType[i](item).toString()}`;
    }).join(",");
  } else if (!Array.isArray(keyName) && !Array.isArray(key) && !Array.isArray(keyType)) {
    useId = keyType(key).toString();
  } else {
    throw new Error("The ids and value builders must both be arrays or non-arrays");
  }

  if (routingType === "slash") {
    return `${url}/${useId}`;
  } else {
    return `${url}(${useId})`;
  }
}
