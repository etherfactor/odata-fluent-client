import { extendUrl, HttpMethod } from "../../utils/http";
import { SafeAny } from "../../utils/types";
import { ODataClientOptions } from "../client/odata-client";
import { EntitySet, EntitySetImpl } from "../entity/set/entity-set";
import { EntitySetWorker } from "../entity/set/entity-set-worker";
import { EntitySetWorkerImpl } from "../entity/set/entity-set-worker.impl";
import { EntitySingle, EntitySingleImpl } from "../entity/single/entity-single";
import { EntitySingleWorker } from "../entity/single/entity-single-worker";
import { EntitySingleWorkerImpl } from "../entity/single/entity-single-worker.impl";
import { Action } from "./action";

export interface ActionImplOptions {
  rootOptions: ODataClientOptions;
  name: string;
  method: HttpMethod;
  isBody: boolean;
  isCollection: boolean;
}

export class ActionImpl<
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements Action<TParameter, TCollection, TReturn> {

  private readonly options;

  constructor(
    options: ActionImplOptions,
  ) {
    this.options = options;
  }

  private createSetWorker(parameters: TParameter): EntitySetWorker<TReturn> {
    const body = this.options.isBody ? parameters : undefined;
    const query = this.options.isBody ? undefined : Object.keys(parameters).map(key => `${key}=${encodeURIComponent(parameters[key as keyof typeof parameters]?.toString() ?? "")}`).join("&");
    
    const url = extendUrl(this.options.rootOptions.serviceUrl, this.options.name) + query ? `?${query}` : "";
    return new EntitySetWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: this.options.method,
      url: url,
      payload: body,
      validator: undefined, //TODO: add this
    });
  }

  private createSingleWorker(parameters: TParameter): EntitySingleWorker<TReturn> {
    const body = this.options.isBody ? parameters : undefined;
    const query = this.options.isBody ? undefined : Object.keys(parameters).map(key => `${key}=${encodeURIComponent(parameters[key as keyof typeof parameters]?.toString() ?? "")}`).join("&");
    
    const url = extendUrl(this.options.rootOptions.serviceUrl, this.options.name) + query ? `?${query}` : "";
    return new EntitySingleWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: this.options.method,
      url: url,
      payload: body,
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
