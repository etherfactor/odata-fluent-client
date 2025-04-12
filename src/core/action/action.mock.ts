import { SafeAny } from "../../utils/types";
import { MockODataClientOptions } from "../client/odata-client.mock";
import { EntitySet, EntitySetImpl } from "../entity/set/entity-set";
import { EntitySetWorker } from "../entity/set/entity-set-worker";
import { EntitySetWorkerMock } from "../entity/set/entity-set-worker.mock";
import { EntitySingle, EntitySingleImpl } from "../entity/single/entity-single";
import { EntitySingleWorker } from "../entity/single/entity-single-worker";
import { EntitySingleWorkerMock } from "../entity/single/entity-single-worker.mock";
import { Action, EntityAction } from "./action";

export interface ActionMockOptions {
  rootOptions: MockODataClientOptions;
  name: string;
  isCollection: boolean;
}

export class ActionMock<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements Action<TParameter, TCollection, TReturn> {

  private readonly options;

  constructor(
    options: ActionMockOptions,
  ) {
    this.options = options;
  }

  private createSetWorker(parameters: TParameter): EntitySetWorker<TReturn> {
    return new EntitySetWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.options.rootOptions.actions[this.options.name].handler(undefined, parameters),
      validator: undefined, //TODO: add this
    });
  }

  private createSingleWorker(parameters: TParameter): EntitySingleWorker<TReturn> {
    return new EntitySingleWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.options.rootOptions.actions[this.options.name].handler(undefined, parameters),
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

export interface EntityActionMockOptions extends ActionMockOptions { }

export class EntityActionMock<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements EntityAction<TKey, TParameter, TCollection, TReturn> {

  private readonly options;

  constructor(
    options: ActionMockOptions,
  ) {
    this.options = options;
  }

  private createSetWorker(key: TKey, parameters: TParameter): EntitySetWorker<TReturn> {
    return new EntitySetWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.options.rootOptions.actions[this.options.name].handler(key, parameters),
      validator: undefined, //TODO: add this
    });
  }

  private createSingleWorker(key: TKey, parameters: TParameter): EntitySingleWorker<TReturn> {
    return new EntitySingleWorkerMock({
      rootOptions: this.options.rootOptions,
      getData: () => this.options.rootOptions.actions[this.options.name].handler(key, parameters),
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
