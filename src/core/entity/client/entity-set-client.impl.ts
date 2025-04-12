import { HttpMethod, extendUrl } from "../../../utils/http";
import { SafeAny } from "../../../utils/types";
import { Value } from "../../../values/base";
import { ODataClientOptions, ODataPathRoutingType } from "../../client/odata-client";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntitySet, EntitySetImpl } from "../set/entity-set";
import { EntitySetWorker } from "../set/entity-set-worker";
import { EntitySetWorkerImpl } from "../set/entity-set-worker.impl";
import { EntitySingle, EntitySingleImpl } from "../single/entity-single";
import { EntitySingleWorker } from "../single/entity-single-worker";
import { EntitySingleWorkerImpl } from "../single/entity-single-worker.impl";
import { EntityKey, EntityPropertyType } from "./builder/entity-set-client-builder";
import { EntitySetClientFull } from "./entity-set-client";

export interface EntitySetClientImplOptions {
  rootOptions: ODataClientOptions;
  entitySet: string;
  key: unknown | unknown[];
  keyType: ((value: unknown) => Value<unknown>) | ((value: unknown) => Value<unknown>)[];
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => unknown | Error;
  readSet?: HttpMethod;
  read?: HttpMethod;
  create?: HttpMethod;
  update?: HttpMethod;
  delete?: HttpMethod;
}

export class EntitySetClientImpl<TEntity, TKey extends EntityKey<TEntity>> implements EntitySetClientFull<TEntity, TKey> {
  
  private readonly options: EntitySetClientImplOptions;
  private readonly entitySetUrl: string;

  constructor(
    options: EntitySetClientImplOptions,
  ) {
    this.options = options;
    this.entitySetUrl = extendUrl(this.options.rootOptions.serviceUrl, this.options.entitySet);
  }

  private createSetWorker(method: HttpMethod, url: string, payload?: Partial<TEntity>): EntitySetWorker<TEntity> {
    return new EntitySetWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: method,
      url: url,
      payload: payload,
      validator: this.options.validator as SafeAny, //generic typing doesn't play nicely with this
    });
  }

  private createSingleWorker(method: HttpMethod, url: string, payload?: Partial<TEntity>): EntitySingleWorker<TEntity> {
    return new EntitySingleWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: method,
      url: url,
      payload: payload,
      validator: this.options.validator as SafeAny, //generic typing doesn't play nicely with this
    });
  }

  get name(): string {
    return this.options.entitySet;
  }

  buildUrl(key: EntityPropertyType<TEntity, TKey>): string {
    const url = extendEntityUrl(this.entitySetUrl, this.options.rootOptions.routingType, this.options.key, key, this.options.keyType);
    return url;
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

    const url = extendEntityUrl(this.entitySetUrl, this.options.rootOptions.routingType, this.options.key, key, this.options.keyType);
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

    const url = extendEntityUrl(this.entitySetUrl, this.options.rootOptions.routingType, this.options.key, key, this.options.keyType);
    const worker = this.createSingleWorker(this.options.update, url, entity);
    return new EntitySingleImpl(worker);
  }

  async delete(key: EntityPropertyType<TEntity, TKey>): Promise<void> {
    if (!this.options.update)
      throw new Error("This resource does not support deleting entities");

    const url = extendEntityUrl(this.entitySetUrl, this.options.rootOptions.routingType, this.options.key, key, this.options.keyType);
    //TODO Add this
  }
}

export function extendEntityUrl(url: string, routingType: ODataPathRoutingType, keyName: unknown | unknown[], key: unknown | unknown[], keyType: ((value: unknown) => Value<unknown>) | ((value: unknown) => Value<unknown>)[]) {
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
