import { extendUrl, HttpMethod } from "../../utils/http";
import { SafeAny } from "../../utils/types";
import { Value } from "../../values/base";
import { ODataClientOptions } from "../client/odata-client";
import { EntitySetClient } from "../entity/client/entity-set-client";
import { EntitySet, EntitySetImpl } from "../entity/set/entity-set";
import { EntitySetWorker } from "../entity/set/entity-set-worker";
import { EntitySetWorkerImpl } from "../entity/set/entity-set-worker.impl";
import { EntitySingle, EntitySingleImpl } from "../entity/single/entity-single";
import { EntitySingleWorker } from "../entity/single/entity-single-worker";
import { EntitySingleWorkerImpl } from "../entity/single/entity-single-worker.impl";
import { ParameterValue } from "../invokable/invokable-builder";
import { Action, EntityAction } from "./action";

export interface ActionImplOptions {
  rootOptions: ODataClientOptions;
  name: string;
  method: HttpMethod;
  isBody: boolean;
  values?: ParameterValue<SafeAny>;
  converter?: (value: SafeAny) => SafeAny;
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

  private getBody(parameters: TParameter) {
    if (!this.options.isBody)
      return undefined;

    if (this.options.converter)
      return this.options.converter(parameters);

    return parameters;
  }

  private getQuery(parameters: TParameter) {
    if (this.options.isBody)
      return undefined;

    const valuesMap = this.options.values;
    if (!valuesMap)
      throw new Error("Must specify a value converter when calling .withParameters");

    const keys = Object.keys(parameters);
    const values = keys
      .map(key => ({ key: key, value: <Value<SafeAny>>(valuesMap as SafeAny)[key](parameters[key as keyof typeof parameters]) }))
      .map(data => `${data.key}=${encodeURIComponent(data.value.toString())}`)
      .join("&");
    
    return values;
  }

  private createSetWorker(parameters: TParameter): EntitySetWorker<TReturn> {
    const body = this.getBody(parameters);
    const query = this.getQuery(parameters);
    
    const url = extendUrl(this.options.rootOptions.serviceUrl, this.options.name) + (query ? `?${query}` : "");
    return new EntitySetWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: this.options.method,
      url: url,
      payload: body,
      validator: undefined, //TODO: add this
    });
  }

  private createSingleWorker(parameters: TParameter): EntitySingleWorker<TReturn> {
    const body = this.getBody(parameters);
    const query = this.getQuery(parameters);
    
    const url = extendUrl(this.options.rootOptions.serviceUrl, this.options.name) + (query ? `?${query}` : "");
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

export interface EntityActionImplOptions extends ActionImplOptions {
  entitySet: EntitySetClient<SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny, SafeAny>;
}

export class EntityActionImpl<
  TKey,
  TParameter extends {},
  TCollection extends boolean,
  TReturn,
> implements EntityAction<TKey, TParameter, TCollection, TReturn> {

  private readonly options;

  constructor(
    options: EntityActionImplOptions,
  ) {
    this.options = options;
  }

  private getBody(parameters: TParameter) {
    if (!this.options.isBody)
      return undefined;

    if (this.options.converter)
      return this.options.converter(parameters);

    return parameters;
  }

  private getQuery(parameters: TParameter) {
    if (this.options.isBody)
      return undefined;

    const valuesMap = this.options.values;
    if (!valuesMap)
      throw new Error("Must specify a value converter when calling .withParameters");

    const keys = Object.keys(parameters);
    const values = keys
      .map(key => ({ key: key, value: <Value<SafeAny>>(valuesMap as SafeAny)[key](parameters[key as keyof typeof parameters]) }))
      .map(data => `${data.key}=${encodeURIComponent(data.value.toString())}`)
      .join("&");
    
    return values;
  }

  private createSetWorker(key: TKey, parameters: TParameter): EntitySetWorker<TReturn> {
    const body = this.getBody(parameters);
    const query = this.getQuery(parameters);
    
    const entityUrl = this.options.entitySet.buildUrl(key);
    const url = extendUrl(entityUrl, this.options.name) + (query ? `?${query}` : "");
    return new EntitySetWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: this.options.method,
      url: url,
      payload: body,
      validator: undefined, //TODO: add this
    });
  }

  private createSingleWorker(key: TKey, parameters: TParameter): EntitySingleWorker<TReturn> {
    const body = this.getBody(parameters);
    const query = this.getQuery(parameters);
    
    const entityUrl = this.options.entitySet.buildUrl(key);
    const url = extendUrl(entityUrl, this.options.name) + (query ? `?${query}` : "");
    return new EntitySingleWorkerImpl({
      rootOptions: this.options.rootOptions,
      method: this.options.method,
      url: url,
      payload: body,
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
