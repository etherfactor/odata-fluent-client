import { SafeAny } from "../../utils/types";
import { NewMockODataClientOptions } from "../client/odata-client.mock";
import { EntitySet, EntitySetImpl } from "../entity/set/entity-set";
import { EntitySetWorker } from "../entity/set/entity-set-worker";
import { EntitySetWorkerMock } from "../entity/set/entity-set-worker.mock";
import { EntitySingle, EntitySingleImpl } from "../entity/single/entity-single";
import { EntitySingleWorker } from "../entity/single/entity-single-worker";
import { EntitySingleWorkerMock } from "../entity/single/entity-single-worker.mock";
import { Action } from "./action";

export interface ActionMockOptions {
  rootOptions: NewMockODataClientOptions;
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

  private createSetWorker(): EntitySetWorker<TReturn> {
    return new EntitySetWorkerMock({
      rootOptions: this.options.rootOptions,
      entitySet: this.options.name,
      validator: undefined, //TODO: add this
    });
  }

  private createSingleWorker(id: unknown | unknown[]): EntitySingleWorker<TReturn> {
    return new EntitySingleWorkerMock({
      rootOptions: this.options.rootOptions,
      entitySet: this.options.name,
      id: id,
      validator: undefined, //TODO: add this
    });
  }
  
  invoke(parameters: TParameter): TCollection extends true ? EntitySet<TReturn> : EntitySingle<TReturn> {
    if (this.options.isCollection) {
      const worker = this.createSetWorker();
      return new EntitySetImpl(worker) as SafeAny;
    } else {
      const worker = this.createSingleWorker(undefined); //TODO: fix this
      return new EntitySingleImpl(worker) as SafeAny;
    }
  }
}
