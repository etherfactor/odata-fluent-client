import { HttpMethod } from "../../../utils/http";
import { toIdString } from "../../../utils/id";
import { EntitySelectExpand } from "../../entity/entity-select-expand";
import { EntitySet, EntitySetImpl, EntitySetWorker } from "../../entity/entity-set";
import { EntitySetClientFull } from "../../entity/entity-set-client";
import { EntityKey, EntityPropertyType } from "../../entity/entity-set-client-builder";
import { EntitySingle, EntitySingleWorker } from "../../entity/entity-single";
import { EntitySingleImpl } from "../../entity/entity-single.impl";
import { EntitySetWorkerMock } from "./entity-set.mock";
import { EntitySingleWorkerMock } from "./entity-single.mock";

export interface MockEntitySetClientOptions {
  entitySet: Record<string, object>;
  addIdToEntity?: (entity: any) => string;
  validator?: (value: unknown, selectExpand: EntitySelectExpand) => unknown | Error;
  readSet?: HttpMethod;
  read?: HttpMethod;
  create?: HttpMethod;
  update?: HttpMethod;
  delete?: HttpMethod;
}

export class EntitySetClientMock<TEntity, TKey extends EntityKey<TEntity>> implements EntitySetClientFull<TEntity, TKey> {
  
  private readonly options: MockEntitySetClientOptions;

  constructor(
    options: MockEntitySetClientOptions,
  ) {
    this.options = options;
  }

  private createSetWorker(): EntitySetWorker<TEntity> {
    return new EntitySetWorkerMock({
      getData: () => this.options.entitySet as Record<string, TEntity>,
      validator: this.options.validator as any,
    });
  }

  private createSingleWorker(id: unknown | unknown[]): EntitySingleWorker<TEntity> {
    return new EntitySingleWorkerMock({
      getData: () => this.options.entitySet as Record<string, TEntity>,
      id: id,
      validator: this.options.validator as any,
    });
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

    if (!this.options.addIdToEntity)
      throw new Error("Must define an 'addIdToEntity' for this entity set");

    const newId = this.options.addIdToEntity(entity);
    this.options.entitySet[newId] = entity;

    const worker = this.createSingleWorker(newId);
    return new EntitySingleImpl(worker);
  }

  update(key: EntityPropertyType<TEntity, TKey>, entity: Partial<TEntity>): EntitySingle<TEntity> {
    if (!this.options.update)
      throw new Error("This resource does not support updating entities");

    const id = toIdString(key);
    this.options.entitySet[id] = {...this.options.entitySet[id], ...entity};

    const worker = this.createSingleWorker(key);
    return new EntitySingleImpl(worker);
  }

  async delete(key: EntityPropertyType<TEntity, TKey>): Promise<void> {
    if (!this.options.update)
      throw new Error("This resource does not support deleting entities");

    //TODO Add this
  }
}
