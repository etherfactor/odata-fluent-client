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

  abstract getData(parameters: TParameter): SafeAny;

  private createSetWorker(parameters: TParameter): EntitySetWorker<TReturn> {
    return new EntitySetWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.getData(parameters),
      validator: undefined, //TODO: add this
    });
  }

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

  abstract getData(key: TKey, parameters: TParameter): SafeAny;

  private createSetWorker(key: TKey, parameters: TParameter): EntitySetWorker<TReturn> {
    return new EntitySetWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.getData(key, parameters),
      validator: undefined, //TODO: add this
    });
  }

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
