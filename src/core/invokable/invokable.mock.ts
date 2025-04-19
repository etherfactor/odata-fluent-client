import { SafeAny } from "../../utils/types";
import { MockODataClientOptions } from "../client/odata-client.mock";
import { EntitySet, EntitySetImpl } from "../entity/set/entity-set";
import { EntitySetWorker } from "../entity/set/entity-set-worker";
import { EntitySetWorkerMock } from "../entity/set/entity-set-worker.mock";
import { EntitySingle, EntitySingleImpl } from "../entity/single/entity-single";
import { EntitySingleWorker } from "../entity/single/entity-single-worker";
import { EntitySingleWorkerMock } from "../entity/single/entity-single-worker.mock";
import { EntityInvokable, Invokable } from "./invokable";

export interface InvokableMockOptions {
  rootOptions: MockODataClientOptions;
  name: string;
  isCollection: boolean;
}

/**
 * A mock invokable.
 */
export abstract class InvokableMock<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements Invokable<TParameter, TCollection, TReturn> {

  protected readonly options;

  constructor(
    options: InvokableMockOptions,
  ) {
    this.options = options;
  }

  /**
   * Calls the invokable and returns the resulting data.
   * @param parameters The user-provided parameters.
   */
  abstract getData(parameters: TParameter): SafeAny;

  /**
   * Creates a worker for a collection response.
   * @param parameters The user-provided invokable parameters.
   * @returns The worker.
   */
  private createSetWorker(parameters: TParameter): EntitySetWorker<TReturn> {
    return new EntitySetWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.getData(parameters),
      validator: undefined, //TODO: add this
    });
  }

  /**
   * Creates a worker for a single response.
   * @param parameters The user-provided invokable parameters.
   * @returns The worker.
   */
  private createSingleWorker(parameters: TParameter): EntitySingleWorker<TReturn> {
    return new EntitySingleWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.getData(parameters),
      validator: undefined, //TODO: add this
    });
  }
  
  invoke(parameters: TParameter): TCollection extends true ? EntitySet<TReturn> : EntitySingle<TReturn> {
    if (this.options.isCollection) {
      const worker = this.createSetWorker(parameters);
      return new EntitySetImpl(worker) as SafeAny;
    } else {
      const worker = this.createSingleWorker(parameters);
      return new EntitySingleImpl(worker) as SafeAny;
    }
  }
}

export interface EntityInvokableMockOptions extends InvokableMockOptions { }

/**
 * A mock invokable, targeting an entity.
 */
export abstract class EntityInvokableMock<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements EntityInvokable<TKey, TParameter, TCollection, TReturn> {

  protected readonly options;

  constructor(
    options: InvokableMockOptions,
  ) {
    this.options = options;
  }

  /**
   * Calls the invokable and returns the resulting data.
   * @param key The id of the entity upon which this invokable is executed.
   * @param parameters The user-provided parameters.
   */
  abstract getData(key: TKey, parameters: TParameter): SafeAny;

  /**
   * Creates a worker for a collection response.
   * @param key The id of the entity upon which this invokable is executed.
   * @param parameters The user-provided invokable parameters.
   * @returns The worker.
   */
  private createSetWorker(key: TKey, parameters: TParameter): EntitySetWorker<TReturn> {
    return new EntitySetWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.getData(key, parameters),
      validator: undefined, //TODO: add this
    });
  }

  /**
   * Creates a worker for a single response.
   * @param key The id of the entity upon which this invokable is executed.
   * @param parameters The user-provided invokable parameters.
   * @returns The worker.
   */
  private createSingleWorker(key: TKey, parameters: TParameter): EntitySingleWorker<TReturn> {
    return new EntitySingleWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.getData(key, parameters),
      validator: undefined, //TODO: add this
    });
  }

  invoke(key: TKey, parameters: TParameter): TCollection extends true ? EntitySet<TReturn> : EntitySingle<TReturn> {
    if (this.options.isCollection) {
      const worker = this.createSetWorker(key, parameters);
      return new EntitySetImpl(worker) as SafeAny;
    } else {
      const worker = this.createSingleWorker(key, parameters);
      return new EntitySingleImpl(worker) as SafeAny;
    }
  }
}
