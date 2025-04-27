import { HttpMethod } from "../../../utils/http";
import { toIdString } from "../../../utils/id";
import { MockODataClientOptions } from "../../client/odata-client.mock";
import { EntitySelectExpand } from "../expand/entity-select-expand";
import { EntitySet, EntitySetImpl } from "../set/entity-set";
import { EntitySetWorker } from "../set/entity-set-worker";
import { EntitySetWorkerMock } from "../set/entity-set-worker.mock";
import { EntitySingle, EntitySingleImpl } from "../single/entity-single";
import { EntitySingleWorker } from "../single/entity-single-worker";
import { EntitySingleWorkerMock } from "../single/entity-single-worker.mock";
import { EntityKey, EntityPropertyType } from "./builder/entity-set-client-builder";
import { EntitySetClientFull } from "./entity-set-client";

export interface EntitySetClientMockOptions {
  rootOptions: MockODataClientOptions;
  entitySet: string;
  addIdToEntity?: (entity: any) => string;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => unknown | Error;
  readSet?: HttpMethod;
  read?: HttpMethod;
  create?: HttpMethod;
  update?: HttpMethod;
  delete?: HttpMethod;
}

/**
 * A mock entity set client.
 */
export class EntitySetClientMock<TEntity, TKey extends EntityKey<TEntity>> implements EntitySetClientFull<TEntity, TKey> {
  
  private readonly options: EntitySetClientMockOptions;

  constructor(
    options: EntitySetClientMockOptions,
  ) {
    this.options = options;
  }

  private createSetWorker(): EntitySetWorker<TEntity> {
    return new EntitySetWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.options.rootOptions.entitySets[this.options.entitySet].data(),
      validator: this.options.validator as any,
    });
  }

  private createSingleWorker(id: unknown | unknown[]): EntitySingleWorker<TEntity> {
    const idString = toIdString(id);
    return new EntitySingleWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.options.rootOptions.entitySets[this.options.entitySet].data()[idString],
      validator: this.options.validator as any,
    });
  }
  
  get name(): string {
    return this.options.entitySet;
  }

  buildUrl(key: EntityPropertyType<TEntity, TKey>): string {
    throw new Error("Mock clients do not support urls");
  }

  get set(): EntitySet<TEntity> {
    if (!this.options.readSet)
      throw new Error("This resource does not support querying the entity set");

    const worker = this.createSetWorker();
    return new EntitySetImpl(worker);
  }

  read(key: EntityPropertyType<TEntity, TKey>): EntitySingle<TEntity> {
    if (!this.options.read)
      throw new Error("This resource does not support reading entities");

    const worker = this.createSingleWorker(key);
    return new EntitySingleImpl(worker);
  }

  create(entity: Partial<TEntity>): EntitySingle<TEntity> {
    if (!this.options.create)
      throw new Error("This resource does not support creating entities");

    const setOptions = this.options.rootOptions.entitySets[this.options.entitySet];
    const setData = setOptions.data();

    const newId = setOptions.idGenerator();
    if (Array.isArray(setOptions.id)) {
      for (let i = 0; i < setOptions.id.length; i++) {
        entity[setOptions.id[i] as keyof typeof entity] = newId[i];
      }
    } else {
      entity[setOptions.id as keyof typeof entity] = newId;
    }

    const id = toIdString(newId);
    setData[id] = entity;

    const worker = this.createSingleWorker(newId);
    return new EntitySingleImpl(worker);
  }

  update(key: EntityPropertyType<TEntity, TKey>, entity: Partial<TEntity>): EntitySingle<TEntity> {
    if (!this.options.update)
      throw new Error("This resource does not support updating entities");

    const setOptions = this.options.rootOptions.entitySets[this.options.entitySet];
    const setData = setOptions.data();
    
    const id = toIdString(key);
    setData[id] = {...setData[id], ...entity};

    const worker = this.createSingleWorker(key);
    return new EntitySingleImpl(worker);
  }

  async delete(key: EntityPropertyType<TEntity, TKey>): Promise<void> {
    if (!this.options.update)
      throw new Error("This resource does not support deleting entities");

    //TODO Add this
  }
}
