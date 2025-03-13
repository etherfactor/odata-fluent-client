import { EntitySet, EntitySingle } from "../../odata.util";
import { extendUrl, HttpMethod } from "../../utils/http";
import { HttpClientAdapter, RoutingType } from "../client";
import { EntitySetImpl, EntitySetWorker, EntitySetWorkerImpl } from "./set";
import { EntitySingleImpl, EntitySingleWorker, EntitySingleWorkerImpl } from "./single";

export interface ResourceOptions {
  entitySet: string;
  readSet?: HttpMethod;
  readEntity?: HttpMethod;
  create?: HttpMethod;
  update?: HttpMethod;
  delete?: HttpMethod;
}

interface EntityClientFull<TEntity> {
  get set(): EntitySet<TEntity>;
  read(key: unknown): EntitySingle<TEntity>;
  create(entity: Partial<TEntity>): EntitySingle<TEntity>;
  update(key: unknown, entity: Partial<TEntity>): EntitySingle<TEntity>;
  delete(key: unknown): Promise<void>;
}

export type EntityClient<TEntity, TOptions extends ResourceOptions> =
  (TOptions["readSet"] extends string ? Pick<EntityClientFull<TEntity>, "set"> : {}) &
  (TOptions["readEntity"] extends string ? Pick<EntityClientFull<TEntity>, "read"> : {}) &
  (TOptions["create"] extends string ? Pick<EntityClientFull<TEntity>, "create"> : {}) &
  (TOptions["update"] extends string ? Pick<EntityClientFull<TEntity>, "update"> : {}) &
  (TOptions["delete"] extends string ? Pick<EntityClientFull<TEntity>, "delete"> : {});

export class EntityClientImpl<TEntity, TOptions extends ResourceOptions> implements EntityClientFull<TEntity> {
  
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
  ): EntitySetWorker<TEntity> {
    return new EntitySetWorkerImpl({
      adapter: this.adapter,
      method: method,
      url: url,
    });
  }

  private createSingleWorker(
    method: HttpMethod,
    url: string,
  ): EntitySingleWorker<TEntity> {
    return new EntitySingleWorkerImpl({
      adapter: this.adapter,
      method: method,
      url: url,
    });
  }

  get set(): EntitySet<TEntity> {
    if (!this.options.readSet)
      throw new Error("This resource does not support querying the entity set");

    const url = this.entitySetUrl;
    const worker = this.createSetWorker(this.options.readSet, url);
    return new EntitySetImpl(worker);
  }

  read(key: unknown): EntitySingle<TEntity> {
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
    const worker = this.createSingleWorker(this.options.create, url);
    return new EntitySingleImpl(worker);
  }

  update(key: unknown, entity: Partial<TEntity>): EntitySingle<TEntity> {
    if (!this.options.update)
      throw new Error("This resource does not support updating entities");

    const url = this.entitySetUrl;
    const worker = this.createSingleWorker(this.options.update, url);
    return new EntitySingleImpl(worker);
  }

  async delete(key: unknown): Promise<void> {
    if (!this.options.update)
      throw new Error("This resource does not support deleting entities");

    //TODO Add this
  }
}
